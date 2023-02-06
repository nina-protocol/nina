import React, { useState, useContext, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { imageManager } from '@nina-protocol/nina-internal-sdk/esm/utils'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import { useWallet } from '@solana/wallet-adapter-react'
const { getImageFromCDN, loader } = imageManager
const ReleasePurchase = dynamic(() => import('./ReleasePurchase'))
const AddToHubModal = dynamic(() => import('./AddToHubModal'))

const PostRelease = ({ metadata, releasePubkey, hubPubkey }) => {
  const router = useRouter()
  const wallet = useWallet()
  const [amountHeld, setAmountHeld] = useState()

  const { updateTrack, track, isPlaying, setInitialized, audioPlayerRef } =
    useContext(Audio.Context)
  const { releaseState, getRelease } = useContext(Release.Context)
  const {
    getHub,
    hubState,
    getHubsForUser,
    filterHubsForUser,
    hubCollaboratorsState,
  } = useContext(Hub.Context)

  const [userHubs, setUserHubs] = useState()

  // const {current: releasePubkey} = useRef(router.query.releasePubkey)

  // const [metadata, setMetadata] = useState(
  //   metadata || null
  // )

  useEffect(() => {
    if (!hubState[hubPubkey]) {
      getHub(hubPubkey)
    }
  }, [hubPubkey])

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey)
    }
  }, [releasePubkey])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && !metadata) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState, metadata, releasePubkey])

  useEffect(() => {
    if (wallet.connected && hubState[hubPubkey] && !userHubs) {
      getHubsForUser(wallet.publicKey.toBase58())
    }
  }, [wallet.connect, hubState[hubPubkey]])

  useEffect(() => {
    if (wallet.connected && hubState) {
      setUserHubs(filterHubsForUser(wallet.publicKey.toBase58()))
    }
  }, [hubState])

  return (
    <>
      <DesktopImageGridItem item md={6}>
        {metadata && metadata.image && (
          <ImageContainer>
            <Image
              src={getImageFromCDN(metadata.image, 600)}
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
      <StyledGrid
        item
        md={6}
        xs={12}
        sx={{
          padding: '0px',
          maxHeight: { xs: 'unset', md: '30vh' },
          overflowY: 'scroll',
          paddingBottom: { md: '15px' },
        }}
      >
        {metadata && metadata.image && (
          <>
            <MobileImageWrapper>
              <Image
                src={getImageFromCDN(metadata.image, 600)}
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
                alignItems={'flex-start'}
                sx={{ mt: '0px', mb: { md: '15px', xs: '0px' } }}
              >
                <PlayButton
                  sx={{ height: '22px', width: '28px', m: 0, paddingLeft: 0 }}
                  onClickCapture={(e) => {
                    e.stopPropagation()
                    setInitialized(true)
                    if (!audioPlayerRef.current.src) {
                      audioPlayerRef.current.load()
                    }
                    updateTrack(
                      releasePubkey,
                      !(isPlaying && track.releasePubkey === releasePubkey),
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
              </Box>
            </CtaWrapper>
          </>
        )}
        <ReleasePurchase
          releasePubkey={releasePubkey}
          metadata={metadata}
          inPost={true}
          hubPubkey={hubPubkey}
          amountHeld={amountHeld}
          setAmountHeld={setAmountHeld}
        />
      </StyledGrid>
    </>
  )
}

const PlayButton = styled(Button)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  padding: '0 10px',
  color: `${theme.palette.text.primary} !important`,
  ':disabled': {
    color: theme.palette.text.primary + 'a0',
  },
  '&:hover': {
    opacity: '50%',
    backgroundColor: `${theme.palette.transparent} !important`,
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

const StyledGrid = styled(Grid)(() => ({
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}))

const CtaWrapper = styled(Box)(() => ({
  display: 'flex',
  marginTop: '15px',
}))

export default PostRelease
