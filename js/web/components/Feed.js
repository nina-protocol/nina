import React, { useContext, useEffect } from 'react'
import Image from 'next/image'
import { useState, useRef, useMemo } from 'react'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
const { getImageFromCDN, loader } = imageManager
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Button from '@mui/material/Button'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import { useRouter } from 'next/router'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import { timeSince } from '@nina-protocol/nina-internal-sdk/src/utils'
import { isMobile } from 'react-device-detect'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const Feed = ({
  // publicKey,
  toggleDrawer,
  defaultItems,
}) => {
  const { updateTrack, isPlaying, setIsPlaying, track } = useContext(
    Audio.Context
  )
  const { displayNameForAccount, displayImageForAccount } = useContext(
    Nina.Context
  )
  const { getFeedForUser } = useContext(Release.Context)
  const router = useRouter()
  const { wallet } = useContext(Wallet.Context)
  const [pendingFetch, setPendingFetch] = useState(false)
  const scrollRef = useRef()
  const [feedFetched, setFeedFetched] = useState(false)
  const [itemsTotal, setItemsTotal] = useState(0)
  const [items, setItems] = useState(undefined)
  const publicKey = useMemo(() => {
    return wallet.publicKey?.toBase58() || process.env.NINA_SUBSCRIPTION_PUBKEY
  }, [wallet?.publicKey])

  useEffect(() => {
    const handleFetch = async (refresh = false) => {
      await handleGetFeedForUser(publicKey, refresh)
      await getHubSuggestionsForUser(publicKey)
    }

    if (wallet && !wallet.connecting) {
      handleFetch(true)
    }
  }, [wallet.connecting, wallet.publicKey])

  const handleGetFeedForUser = async (publicKey, refresh = false) => {
    if (refresh) {
      setFeedFetched(false)
    }
    const feed = await getFeedForUser(
      publicKey,
      refresh ? 0 : feedItems?.length || 0
    )

    if (feed) {
      feed.feedItems = feed.feedItems.filter((item) => {
        if (item.type !== 'ReleaseInitViaHub') {
          return item
        } else if (item.release !== undefined) {
          return item
        }
      })

      setItemsTotal(feed.total)
      if (feedItems && feedItems.length > 0 && !refresh) {
        setItems(items.concat(feed?.feedItems))
      } else {
        setItems(feed?.feedItems)
      }
    }
    setFeedFetched(true)
  }

  const getHubSuggestionsForUser = async (publicKey) => {
    const suggestions = []
    try {
      const { data } = await axios.get(
        `${process.env.NINA_API_ENDPOINT}/accounts/${publicKey}/hubSuggestions`
      )
      data.suggestions.forEach((suggestion) => {
        suggestions.push(suggestion)
      })
      setHubSuggestions(suggestions)
    } catch (error) {
      return []
    }
  }

  const handleScroll = async () => {
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
    if (bottom && !pendingFetch && itemsTotal !== feedItems.length) {
      setPendingFetch(true)
      await handleGetFeedForUser(publicKey)
      setPendingFetch(false)
    }
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      logEvent('navigator_play', 'engagement', {
        wallet: wallet.publicKey?.toBase58(),
        release: releasePubkey,
      })
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleClick = (e, path, type) => {
    e.stopPropagation()
    e.preventDefault()
    logEvent('navigator_interaction', 'engagement', {
      type,
      wallet: wallet?.publicKey?.toBase58(),
      path,
    })
    router.push(path)

    if (isMobile) {
      toggleDrawer(false)
    }
  }

  const feedItems = useMemo(() => {
    const fetchedFeedItems = items?.length > 0 ? items : defaultItems
    const feedItemComponents = fetchedFeedItems?.map((item, i) => {
      switch (item?.type) {
        case 'HubInitWithCredit':
          return (
            <ImageCard>
              <HoverContainer
                href={`/hubs/${item?.hub?.handle}`}
                passHref
                onClick={(e) =>
                  handleClick(e, `/hubs/${item.hub?.handle}`, item?.type)
                }
              >
                <Image
                  height={'400px'}
                  width={'400px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.hub?.data.image,
                    600,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>
                  New Hub:{' '}
                  <Link href={`/hubs/${item?.hub?.handle}`} passHref>
                    <a>{`${item?.hub?.data?.displayName}`}</a>
                  </Link>{' '}
                  created by{' '}
                  <Link href={`/profiles/${item.authority.publicKey}`} passHref>
                    <a>{displayNameForAccount(item.authority.publicKey)}</a>
                  </Link>
                </Typography>

                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'ReleaseInitWithCredit':
          return (
            <ImageCard>
              <HoverContainer
                href={`/${item.release?.publicKey}`}
                passHref
                onClick={(e) =>
                  handleClick(e, `/${item.release?.publicKey}`, item?.type)
                }
              >
                <Image
                  height={'400px'}
                  width={'400px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    600,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
                <HoverCard>
                  <CtaWrapper>
                    <Button
                      onClick={(e) => {
                        handlePlay(e, item.release.publicKey)
                      }}
                    >
                      {isPlaying &&
                      track.releasePubkey === item.release.publicKey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>
                  New Release:{' '}
                  <Link href={`/${item?.release?.publicKey}`} passHref>
                    <a>
                      {`${item.release.metadata.properties.artist} - ${item.release.metadata.properties.title}`}
                    </a>
                  </Link>{' '}
                  by{' '}
                  <Link href={`/profiles/${item.authority.publicKey}`} passHref>
                    <a>{displayNameForAccount(item.authority.publicKey)}</a>
                  </Link>
                </Typography>

                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'ReleaseInitViaHub':
          return (
            <ImageCard>
              <HoverContainer
                href={`/${item.release?.publicKey}`}
                passHref
                onClick={(e) =>
                  handleClick(e, `/${item.release?.publicKey}`, item?.type)
                }
              >
                <Image
                  height={'400px'}
                  width={'400px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    600,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
                <HoverCard>
                  <CtaWrapper>
                    <Button
                      onClick={(e) => {
                        handlePlay(e, item.release.publicKey)
                      }}
                    >
                      {isPlaying &&
                      track.releasePubkey === item.release.publicKey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>
                  New Release:{' '}
                  <Link href={`/${item?.release?.publicKey}`} passHref>
                    <a>
                      {`${item?.release?.metadata?.properties?.artist} - ${item?.release?.metadata?.properties?.title}`}
                    </a>
                  </Link>{' '}
                  via{' '}
                  <Link href={`/hubs/${item?.hub?.handle}`} passHref>
                    <a>{`${item?.hub?.data?.displayName}`}</a>
                  </Link>
                </Typography>
                <Typography fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'ReleasePurchase':
        case 'ReleasePurchaseViaHub':
          return (
            <ImageCard>
              <HoverContainer
                href={`/${item.release?.publicKey}`}
                passHref
                onClick={(e) =>
                  handleClick(e, `/${item.release?.publicKey}`, item?.type)
                }
              >
                <Image
                  height={'400px'}
                  width={'400px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    600,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
                <HoverCard>
                  <CtaWrapper>
                    <Button
                      onClick={(e) => {
                        handlePlay(e, item.release.publicKey)
                      }}
                    >
                      {isPlaying &&
                      track.releasePubkey === item.release.publicKey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1} align="left">
                  Purchase:{' '}
                  <Link href={`/${item.release?.publicKey}`} passHref>
                    <a>
                      {`${item.release?.metadata.properties.artist} - ${item.release?.metadata.properties.title}`}
                    </a>
                  </Link>{' '}
                  by{' '}
                  <Link href={`/profiles/${item.authority.publicKey}`} passHref>
                    <a>{displayNameForAccount(item.authority.publicKey)}</a>
                  </Link>
                  {item.type === 'ReleasePurchaseViaHub' && (
                    <>
                      {' '}
                      from{' '}
                      <Link href={`/hubs/${item.hub.handle}`} passHref>
                        <a>{`${item?.hub?.data?.displayName}`}</a>
                      </Link>
                    </>
                  )}
                </Typography>

                <Typography fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'HubAddCollaborator':
          return (
            <ImageCard>
              <Link href={`/hubs/${item?.hub?.handle}`} passHref>
                <a>
                  <Image
                    height={'400px'}
                    width={'400px'}
                    layout="responsive"
                    src={getImageFromCDN(
                      item?.hub?.data.image,
                      600,
                      Date.parse(item.datetime)
                    )}
                    alt={i}
                    priority={true}
                    loader={loader}
                    unoptimized={true}
                  />
                </a>
              </Link>
              <CopyWrapper>
                <Typography my={1}>
                  <Link href={`/profiles/${item.authority.publicKey}`} passHref>
                    <a>{displayNameForAccount(item.authority.publicKey)}</a>
                  </Link>{' '}
                  added as a collaborator to{' '}
                  <Link
                    href={`/hubs/${item?.hub?.handle}`}
                    passHref
                  >{`${item?.hub?.data?.displayName}`}</Link>
                </Typography>
                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'PostInitViaHubWithReferenceRelease':
        case 'HubAddRelease':
          return (
            <ImageCard>
              <HoverContainer
                href={`/${item.release?.publicKey}`}
                passHref
                onClick={(e) =>
                  handleClick(e, `/${item.release?.publicKey}`, item?.type)
                }
              >
                <Image
                  height={'400px'}
                  width={'400px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    600,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
                <HoverCard>
                  <CtaWrapper>
                    <Button
                      onClick={(e) => {
                        handlePlay(e, item.release.publicKey)
                      }}
                    >
                      {isPlaying &&
                      track.releasePubkey === item.release.publicKey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'text.primary' }}
                        />
                      )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>
                  <Link href={`/${item.release.publicKey}`} passHref>
                    <a>
                      {`${item.release.metadata.properties.artist} - ${item.release.metadata.properties.title}`}
                    </a>
                  </Link>{' '}
                  reposted to{' '}
                  <Link
                    href={`/hubs/${item.hub.handle}`}
                    passHref
                  >{`${item?.hub?.data?.displayName}`}</Link>
                </Typography>

                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )

        // case 'PostInitViaHub':
        //   return (
        //     <MultiCard>
        //       <Box sx={{display: 'flex', width: '100%'}}>
        //         <Box sx={{width: '30%'}}>
        //           <Link href={`/hubs/${item?.hub?.handle}`} passHref>
        //             <Image
        //               height={'30px'}
        //               width={'30px'}
        //               layout="responsive"
        //               src={getImageFromCDN(
        //                 item?.hub?.data.image,
        //                 400,
        //                 Date.parse(item.datetime)
        //               )}
        //               alt={i}
        //               priority={true}
        //               loader={loader}
        //               unoptimized={true}
        //             />
        //           </Link>
        //         </Box>
        //         <Box>
        //           <p>{item.post?.data.title}</p>
        //         </Box>
        //       </Box>
        //       <p>{item.post?.data.body}</p>
        //       <h4>{timeSince(Date.parse(item.datetime))} ago</h4>
        //     </MultiCard>
        //   )

        // case 'PostInitViaHubWithReferenceRelease':
        //   return (
        //     <MultiCard>
        //       <Box sx={{display: 'flex', width: '100%'}}>
        //         <Box sx={{width: '30%'}}>
        //           <Link href={`/hubs/${item.hub.handle}`} passHref>
        //             <Image
        //               height={'30px'}
        //               width={'30px'}
        //               layout="responsive"
        //               src={getImageFromCDN(
        //                 item.release.metadata.image,
        //                 400,
        //                 Date.parse(item.datetime)
        //               )}
        //               alt={i}
        //               priority={true}
        //               loader={loader}
        //               unoptimized={true}
        //             />
        //           </Link>
        //         </Box>
        //         <Box>
        //           <p>{item.post?.data.title}</p>
        //         </Box>
        //       </Box>
        //       <p>{item.post?.data.body}</p>
        //       <h4>{timeSince(Date.parse(item.datetime))} ago</h4>
        //     </MultiCard>
        //   )
        case 'SubscriptionSubscribeAccount':
          const image = displayImageForAccount(item?.toAccount?.publicKey)
          return (
            <ImageCard>
              <Link href={`/profiles/${item.toAccount?.publicKey}`} passHref>
                <a>
                  {image && image.includes('https') ? (
                    <Image
                      height={'400'}
                      width={'400'}
                      layout="responsive"
                      src={getImageFromCDN(
                        image,
                        600,
                        Date.parse(item.datetime)
                      )}
                      alt={i}
                      priority={true}
                      loader={loader}
                      unoptimized={true}
                    />
                  ) : (
                    <Placeholder>
                      <img src={image} width="100%" height="100%" />
                    </Placeholder>
                  )}
                </a>
              </Link>
              <CopyWrapper>
                <Typography my={1}>
                  <Link
                    href={`/profiles/${item.authority?.publicKey}`}
                    passHref
                  >
                    <a>{displayNameForAccount(item.authority?.publicKey)}</a>
                  </Link>{' '}
                  followed{' '}
                  <Link
                    href={`/profiles/${item.toAccount?.publicKey}`}
                    passHref
                  >
                    <a>{displayNameForAccount(item.toAccount?.publicKey)}</a>
                  </Link>
                </Typography>
                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'SubscriptionSubscribeHub':
          return (
            <ImageCard>
              <Link href={`/hubs/${item.toHub.handle}`} passHref>
                <a>
                  <Image
                    height={'400px'}
                    width={'400px'}
                    layout="responsive"
                    src={getImageFromCDN(
                      item.toHub.data.image,
                      600,
                      Date.parse(item.datetime)
                    )}
                    alt={i}
                    priority={true}
                    loader={loader}
                    unoptimized={true}
                  />
                </a>
              </Link>
              <CopyWrapper>
                <Typography my={1}>
                  <Link
                    href={`/profiles/${item.authority?.publicKey}`}
                    passHref
                  >
                    <a>{displayNameForAccount(item.authority?.publicKey)}</a>
                  </Link>{' '}
                  followed{' '}
                  <Link href={`/hubs/${item.toHub.publicKey}`} passHref>
                    <a>{`${item?.toHub?.data?.displayName}`}</a>
                  </Link>
                </Typography>
                <Typography my={1} fontWeight={600}>
                  {timeSince(Date.parse(item.datetime))} ago
                </Typography>
              </CopyWrapper>
            </ImageCard>
          )

        default:
          return null
      }
    })

    return feedItemComponents || []
  }, [items, isPlaying, track])

  if (publicKey && !feedFetched) {
    return (
      <Box mt={4} height="100%" display="flex" justifyContent="center">
        <Dots size="80px" />
      </Box>
    )
  }
  return (
    <ScrollWrapper onScroll={debounce(async () => await handleScroll(), 500)}>
      {feedItems && wallet?.connected && (
        <Box>
          <FeedWrapper ref={scrollRef}>
            {!items ||
              (items.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    mt: 5,
                    mb: 5,
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="h4" mb={1}>
                    Here you will see recent activity for people and Hubs that
                    you follow.
                  </Typography>
                </Box>
              ))}
            {feedItems?.map((item, index) => (
              <CardWrapper key={index}>{item}</CardWrapper>
            ))}
          </FeedWrapper>
          {feedItems && pendingFetch && (
            <Box>
              <Dots size="80px" />
            </Box>
          )}
          {wallet?.connected &&
            feedItems?.length > 0 &&
            itemsTotal >= feedItems?.length &&
            !pendingFetch && (
              <Typography
                variant="h4"
                sx={{ textAlign: 'center' }}
                paddingBottom="40px"
              >
                No more items
              </Typography>
            )}
        </Box>
      )}
      {feedItems && wallet?.connected === false && (
        <FeedWrapper ref={scrollRef}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" mb={1}>
              Connect your wallet to see the latest activity on Nina relevant to
              you.
            </Typography>
            {feedItems?.map((item, index) => (
              <CardWrapper key={index}>{item}</CardWrapper>
            ))}
          </Box>
        </FeedWrapper>
      )}
    </ScrollWrapper>
  )
}

const ScrollWrapper = styled(Box)(({ theme }) => ({
  overflowY: 'scroll',
  overflowX: 'hidden',
  width: '100%',
  '&::-webkit-scrollbar': {
    display: 'none' /* Safari and Chrome */,
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: '30px 0px',
    overflowY: 'scroll',
  },
}))

const FeedWrapper = styled(Box)(({ theme }) => ({
  padding: '15px',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '30px',
  // border: '2px solid blue',
  // minHeight: '75vh',
  width: '50vw',
  maxWidth: '700px',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 10px',
    overflowX: 'auto',
    minHeight: '80vh',
    width: '80vw',
  },
}))

const CardWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '15px 0px',
}))

const ImageCard = styled(Box)(({ theme }) => ({
  height: 'auto',
  border: '1px solid',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: 'grid',
  gridColumns: '25% 75%',
  gridTemplateColumns: '25% 75%',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '100%',
  },
  '& img': {
    cursor: 'pointer',
  },
}))

const CopyWrapper = styled(Box)(({ theme }) => ({
  padding: '0 15px',
  margin: '5px 0px 15px',
  textAlign: 'left',
}))

const HoverContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
}))

const Placeholder = styled(Box)(({ theme }) => ({
  height: '100%',
}))

const HoverCard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  opacity: 0,
  cursor: 'pointer',
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.background.default + 'c4',
  },
}))

const CtaWrapper = styled(Box)(({ theme }) => ({
  margin: 'auto',
}))

export default Feed
