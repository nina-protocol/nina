import React, {
  useState,
  useContext,
  useEffect,
  createElement,
  Fragment,
  useMemo,
} from 'react'
import dynamic from 'next/dynamic'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { imageManager } from '@nina-protocol/nina-internal-sdk/esm/utils'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import DownloadIcon from '@mui/icons-material/Download'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import { parseChecker } from '@nina-protocol/nina-internal-sdk/esm/utils'
import { useSnackbar } from 'notistack'
import ReleaseSettingsModal from '@nina-protocol/nina-internal-sdk/esm/ReleaseSettingsModal'
import { downloadManager } from '@nina-protocol/nina-internal-sdk/src/utils'
const { downloadAs } = downloadManager

const Button = dynamic(() => import('@mui/material/Button'))
const ReleasePurchase = dynamic(() => import('./ReleasePurchase'))
const AddToHubModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/AddToHubModal')
)

const { getImageFromCDN, loader } = imageManager

const ReleaseComponent = ({ metadataSsr, releasePubkey, hubPubkey }) => {
  const { wallet } = useContext(Wallet.Context)
  const { enqueueSnackbar } = useSnackbar()
  const { updateTrack, track, isPlaying, setInitialized, audioPlayerRef } =
    useContext(Audio.Context)
  const { releaseState, getRelease } = useContext(Release.Context)
  const { getHub, hubState, getHubsForUser, filterHubsForUser } = useContext(
    Hub.Context
  )
  const { getAmountHeld } = useContext(Nina.Context)

  const [metadata, setMetadata] = useState(metadataSsr || null)
  const [description, setDescription] = useState()
  const [userHubs, setUserHubs] = useState()
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [release, setRelease] = useState()
  const [amountHeld, setAmountHeld] = useState(0)
  const isAuthority = useMemo(() => {
    if (wallet.connected) {
      return release?.authority === wallet?.publicKey.toBase58()
    } else {
      return false
    }
  }, [release, wallet.connected])

  useEffect(() => {
    if (hubPubkey && !hubState[hubPubkey]) {
      getHub(hubPubkey)
    }
  }, [])

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey)
    }
  }, [releasePubkey])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
  }, [releasePubkey, releaseState.releaseMintMap])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      setMetadata(releaseState.metadata[releasePubkey])
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState, metadata, releasePubkey])

  useEffect(() => {
    const fetchHubs = async () => {
      const hubs = await getHubsForUser(wallet.publicKey.toBase58())
      setUserHubs(hubs)
    }
    if (wallet.connected && hubState && !userHubs) {
      fetchHubs()
    }
  }, [wallet?.connected, hubState])

  useEffect(() => {
    if (metadata?.descriptionHtml) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(parseChecker(metadata.descriptionHtml))
        .then((file) => {
          setDescription(file.result)
        })
    } else {
      setDescription(metadata?.description)
    }
  }, [metadata?.description])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]?.revenueShareRecipients) {
      releaseState.tokenData[releasePubkey]?.revenueShareRecipients.forEach(
        (recipient) => {
          if (
            wallet?.connected &&
            recipient.recipientAuthority === wallet?.publicKey.toBase58()
          ) {
            setUserIsRecipient(true)
          }
        }
      )
    }
  }, [releaseState.tokenData[releasePubkey], wallet?.connected])

  useEffect(() => {
    if (wallet.disconnecting) {
      setUserIsRecipient(false)
    }
  }, [wallet?.disconnecting])

  return (
    <>
      <StyledGrid
        item
        md={6}
        xs={12}
        sx={{
          margin: { md: '0px auto auto', xs: '0px' },
          padding: { md: '0 15px', xs: '75px 15px' },
        }}
      >
        {release && metadata && metadata.image && (
          <>
            <MobileImageWrapper>
              <Image
                src={getImageFromCDN(
                  metadata.image,
                  1200,
                  new Date(release.releaseDatetime)
                )}
                loader={loader}
                layout="responsive"
                objectFit="contain"
                objectPosition={'center'}
                height={100}
                width={100}
                alt={metadata.description || 'album art'}
              />
            </MobileImageWrapper>

            <CtaWrapper>
              <Typography
                variant="h3"
                align="left"
                sx={{ color: 'text.primary', mr: 1 }}
              >
                {metadata.properties.artist} - {metadata.properties.title}
              </Typography>

              <Box
                display="flex"
                sx={{
                  mt: '15px',
                  mb: { md: '15px', xs: '0px' },
                  color: 'black',
                }}
              >
                <PlayButton
                  sx={{ height: '22px', width: '28px', m: 0, paddingLeft: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    audioPlayerRef.current.load()
                    setInitialized(true)
                    updateTrack(
                      releasePubkey,
                      !(isPlaying && track.releasePubkey === releasePubkey),
                      true,
                      hubPubkey
                    )
                  }}
                >
                  {isPlaying && track.releasePubkey === releasePubkey ? (
                    <PauseCircleOutlineIcon />
                  ) : (
                    <PlayCircleOutlineIcon />
                  )}
                </PlayButton>

                {releasePubkey && metadata && (
                  <AddToHubModal
                    userHubs={userHubs}
                    releasePubkey={releasePubkey}
                    metadata={metadata}
                    hubPubkey={hubPubkey}
                  />
                )}

                <ReleaseSettingsModal
                  userIsRecipient={userIsRecipient}
                  isAuthority={isAuthority}
                  release={release}
                  releasePubkey={releasePubkey}
                  amountHeld={amountHeld}
                  metadata={metadata}
                />

                {amountHeld > 0 && (
                  <Button
                    sx={{
                      height: '22px',
                      width: '28px',
                      m: 0,
                      marginLeft: '4px',
                      paddingTop: '12px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadAs(
                        metadata,
                        releasePubkey,
                        undefined,
                        enqueueSnackbar,
                        wallet.publicKey.toBase58(),
                        hubPubkey,
                        false
                      )
                    }}
                  >
                    <DownloadIcon />
                  </Button>
                )}
              </Box>
            </CtaWrapper>

            <Box
              sx={{
                marginTop: { md: '0px', xs: '30px' },
                marginBottom: '15px',
              }}
            >
              <ReleasePurchase
                releasePubkey={releasePubkey}
                metadata={metadata}
                hubPubkey={hubPubkey}
                amountHeld={amountHeld}
                setAmountHeld={setAmountHeld}
              />
            </Box>

            <StyledDescription align="left">{description}</StyledDescription>
          </>
        )}
      </StyledGrid>

      <DesktopImageGridItem item md={6}>
        {release && metadata && metadata.image && (
          <ImageContainer>
            <Image
              src={getImageFromCDN(
                metadata.image,
                1200,
                new Date(release.releaseDatetime)
              )}
              loader={loader}
              layout="responsive"
              objectFit="contain"
              height="100"
              width="100"
              objectPosition={'right bottom'}
              alt={metadata.description || 'album art'}
            />
          </ImageContainer>
        )}
      </DesktopImageGridItem>
    </>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    '&:-webkit-scrollbar': {
      display: 'none !important',
    },
  },
}))

const PlayButton = styled(Button)(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  ':disabled': {
    color: theme.palette.text.primary + 'a0',
  },
  '&:hover': {
    opacity: '50%',
    backgroundColor: `${theme.palette.transparent} !important`,
  },
}))

const StyledDescription = styled(Typography)(({ theme }) => ({
  fontSize: '18px !important',
  lineHeight: '20.7px !important',
  marginTop: '15px',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '& pre': {
    whiteSpace: 'pre-wrap',
  },
  [theme.breakpoints.up('md')]: {
    maxHeight: '275px',
    overflowY: 'scroll',
    height: '275px',
  },
  [theme.breakpoints.down('md')]: {
    paddingBottom: '40px',
  },
}))

const DesktopImageGridItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const MobileImageWrapper = styled(Grid)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    padding: '30px 0 0',
  },
}))

const ImageContainer = styled(Box)(() => ({
  width: '100%',
}))

const CtaWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    marginTop: '15px',
  },
}))

export default ReleaseComponent
