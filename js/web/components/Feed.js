import React, { useContext } from 'react'
import Image from 'next/image'
import { useState, useRef, useMemo } from 'react'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box  from '@mui/material/Box'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
const { getImageFromCDN, loader } = imageManager
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import Audio from "@nina-protocol/nina-internal-sdk/esm/Audio";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' year' : ' years')
  }
  interval = seconds / 2592000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' month' : ' months')
  }
  interval = seconds / 86400
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' day' : ' days')
  }
  interval = seconds / 3600
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' hour' : ' hours')
  }
  interval = seconds / 60
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' minute' : ' minutes')
  }
  return Math.floor(seconds) + ' seconds'
}

const Feed = ({ items, itemsTotal, toggleDrawer, playFeed, publicKey, handleGetFeedForUser}) => {
  const { updateTrack, isPlaying, setIsPlaying, track } = useContext(Audio.Context);
  const router = useRouter();

  const [pendingFetch, setPendingFetch] = useState(false)
  const scrollRef = useRef()

  const handleScroll = () => {
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
    if (
      bottom &&
      !pendingFetch &&
      itemsTotal !== items.length
    ) {
      setPendingFetch(true)
      handleGetFeedForUser(publicKey)
    }
  }

   const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleClick = (e, path) => {
    e.stopPropagation()
    e.preventDefault()
    router.push(path)
  }
  

  const feedItems = useMemo(() => {
    const feedItemComponents = items?.map((item, i) => {
      switch (item?.type) {
        case 'HubInitWithCredit':
          return (
            <ImageCard>
              <HoverContainer href={`/hubs/${item?.hub?.handle}`}  passHref
                onClick={(e) => handleClick(e, `/${item.hub?.handle}`)}
              >
                <Image
                  height={'100px'}
                  width={'100px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.hub?.data.image,
                    400,
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
                      onClick={(e) => {handlePlay(e, item.release.publicKey)}}
                    >
                      {isPlaying &&
                        track.releasePubkey === item.release?.publicKey ? (
                          <PauseCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        ) : (
                          <PlayCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>New Hub:</Typography>
                <Typography my={1}><Link href={`/hubs/${item?.hub?.handle}`} passHref>{`${item?.hub?.data?.displayName}`}</Link> created by <Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'ReleaseInitWithCredit':
          return (
            <ImageCard>
              <HoverContainer href={`/${item.release?.publicKey}`} passHref
                onClick={(e) => handleClick(e, `/${item.release?.publicKey}`)}
              >
                <Image
                  height={'100px'}
                  width={'100px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    400,
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
                      onClick={(e) => {handlePlay(e, item.release.publicKey)}}
                    >
                      {isPlaying &&
                        track.releasePubkey === item.release.publicKey ? (
                          <PauseCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        ) : (
                          <PlayCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>New Release:</Typography>
                <Typography my={1}><Link href={`/${item.release.publicKey}`} passHref>{`${item.release.metadata.properties.artist} - ${item.release.metadata.properties.title}`}</Link></Typography>
                <Typography my={1}>by <Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </ImageCard>
          )
        case 'ReleaseInitViaHub':
          return (
            <ImageCard>
              <HoverContainer href={`/${item.release?.publicKey}`} passHref
                onClick={(e) => handleClick(e, `/${item.release?.publicKey}`)}
              >
                <Image
                  height={'100px'}
                  width={'100px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.release?.metadata.image,
                    400,
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
                      onClick={(e) => {handlePlay(e, item.release.publicKey)}}
                    >
                      {isPlaying &&
                        track.releasePubkey === item.release.publicKey ? (
                          <PauseCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        ) : (
                          <PlayCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                        )}
                    </Button>
                  </CtaWrapper>
                </HoverCard>
              </HoverContainer>
              <CopyWrapper>
                <Typography my={1}>New Release:</Typography>
                <Typography my={1}><Link href={`/${item.release.publicKey}`} passHref>{`${item.release.metadata.properties.artist} - ${item.release.metadata.properties.title}`}</Link> via <Link href={`/hubs/${item?.hub?.handle}`} passHref>{`${item?.hub?.data?.displayName}`}</Link></Typography>
                <Typography fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </ImageCard>
          )
      case 'ReleasePurchase':
      case 'ReleasePurchaseViaHub':
        return (
          <ImageCard>
            <HoverContainer href={`/${item.release?.publicKey}`} passHref
              onClick={(e) => handleClick(e, `/${item.release?.publicKey}`)}
            >
            <Image
              height={'100px'}
              width={'100px'}
              layout="responsive"
              src={getImageFromCDN(
                item.release?.metadata.image,
                400,
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
                  onClick={(e) => {handlePlay(e, item.release.publicKey)}}
                >
                  {isPlaying &&
                    track.releasePubkey === item.release.publicKey ? (
                      <PauseCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                    ) : (
                      <PlayCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                    )}
                </Button>
              </CtaWrapper>
            </HoverCard>
            </HoverContainer>
            <CopyWrapper>
              <Typography my={1}>Release Purchased:</Typography>
              <Typography my={1}><Link href={`/${item.release?.publicKey}`} passHref>{`${item.release?.metadata.properties.artist} - ${item.release?.metadata.properties.title}`}</Link></Typography>
              <Typography my={1}>by <Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link></Typography>
              {item.type === 'ReleasePurchaseViaHub' && (
                <Typography my={1}>from <Link href={`/hubs/${item.hub.handle}`} passHref>{`${item.hub.data.displayName}`}</Link></Typography>
              )} 
              <Typography fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
            </CopyWrapper>
          </ImageCard>
        )
        case 'HubAddCollaborator':
          return (
            <ImageCard>
              <Link href={`/hubs/${item?.hub?.handle}`} passHref>
                <Image
                  height={'100px'}
                  width={'100px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item?.hub?.data.image,
                    200,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
              </Link>
              <CopyWrapper>
                <Typography my={1}><Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link> added as a collaborator to <Link href={`/hubs/${item?.hub?.handle}`} passHref>{`${item?.hub?.data.displayName}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </ImageCard>
          )

        case 'HubAddRelease':
          return (
            <ImageCard>
              <Link href={`/${item.release.publicKey}`} passHref>
              <Image
                height={'100px'}
                width={'100px'}
                layout="responsive"
                src={getImageFromCDN(
                  item.release.metadata.image,
                  400,
                  Date.parse(item.datetime)
                )}
                alt={i}
                priority={true}
                loader={loader}
                unoptimized={true}
              />
              </Link>
              <CopyWrapper>
                <Typography my={1}><Link href={`/${item.release.publicKey}`} passHref>{`${item.release.metadata.properties.artist} - ${item.release.metadata.properties.title}`}</Link></Typography>
                <Typography my={1}>Reposted to <Link href={`/hubs/${item.hub.handle}`} passHref>{`${item.hub.data.displayName}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
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
          return (
            <TextCard>
              <CopyWrapper>
                <Typography my={1}><Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link> Followed <Link href={`/profiles/${item.toAccount.publicKey}`} passHref>{`${truncateAddress(item.toAccount.publicKey)}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </TextCard>
          )
        case 'SubscriptionSubscribeHub':
          return (
            <ImageCard>
              <Link href={`/hubs/${item.toHub.publicKey}`} passHref>
                <Image
                  height={'100px'}
                  width={'100px'}
                  layout="responsive"
                  src={getImageFromCDN(
                    item.toHub.data.image,
                    400,
                    Date.parse(item.datetime)
                  )}
                  alt={i}
                  priority={true}
                  loader={loader}
                  unoptimized={true}
                />
              </Link>
              <CopyWrapper>
                <Typography my={1}><Link href={`/profiles/${item.authority.publicKey}`} passHref>{`${truncateAddress(item.authority.publicKey)}`}</Link> Followed <Link href={`/hubs/${item.toHub.publicKey}`} passHref>{`${item.toHub.data.displayName}`}</Link></Typography>
                <Typography my={1} fontWeight={600}>{timeSince(Date.parse(item.datetime))} ago</Typography>
              </CopyWrapper>
            </ImageCard>
          )
        
        default:
          return <Typography key={i}>{item?.type}</Typography>
      }
    })
    return feedItemComponents
  }, [items, isPlaying]);

  return (
    <ScrollWrapper
      onScroll={debounce(() => handleScroll(), 500)}
    >
      <Box>
        <FeedWrapper ref={scrollRef}>
          {feedItems && feedItems?.map((item, index) => (
            <CardWrapper key={index}>
              {item}
            </CardWrapper>
          ))}
        </FeedWrapper>
        {itemsTotal === items?.length &&
          <Typography variant="h4" sx={{textAlign: 'center'}}>No more items</Typography>
        }
      </Box>
     </ScrollWrapper>
  )
}

const ScrollWrapper = styled(Box)(({ theme }) => ({
  overflowY: 'scroll',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': { 
    display: 'none'  /* Safari and Chrome */
  },
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    padding: '100px 0px',
    overflowY: 'scroll',
  },
}))

const FeedWrapper = styled(Box)(({ theme }) => ({
  padding: '15px',
  marginTop: '30px',
  minHeight: '75vh',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '80vh',
  },
}))

const CardWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '15px 0px',
}))

const TextCard = styled(Box)(({ theme }) => ({
  border: '1px solid',
}))


const ImageCard =  styled(Box)(({ theme }) => ({
  minHeight: '300px',
  height: 'auto',
  border: '1px solid',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  '& img': {
    cursor: 'pointer',
  },
}))

const CopyWrapper =  styled(Box)(({ theme }) => ({
  padding: '0 15px',
  margin: '5px 0px 15px',
}))

const HoverContainer =  styled(Box)(({ theme }) => ({
  position: 'relative'
}))

const HoverCard =  styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  opacity: 0,
  cursor: 'pointer',
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.background.default + "c4",
  }
}))

const CtaWrapper =  styled(Box)(({ theme }) => ({
    margin: 'auto'
}))




export default Feed