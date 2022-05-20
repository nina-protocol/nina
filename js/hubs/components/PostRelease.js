import React, { useState, useContext, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import nina from '@nina-protocol/nina-sdk'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
const ReleasePurchase = dynamic(() => import('./ReleasePurchase'))
const { HubContext, ReleaseContext, AudioPlayerContext } = nina.contexts

const PostRelease = ({ metadata, releasePubkey }) => {
  const router = useRouter()
  const hubPubkey = process.env.REACT_HUB_PUBLIC_KEY
  const { updateTrack, track, isPlaying } = useContext(AudioPlayerContext)
  const { releaseState, getRelease } = useContext(ReleaseContext)
  const { getHub, hubState } = useContext(HubContext)

  // const {current: releasePubkey} = useRef(router.query.releasePubkey)

  // const [metadata, setMetadata] = useState(
  //   metadataSsr || null
  // )

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey)
    }
  }, [releasePubkey])

  useEffect(() => {
    if (!hubState[hubPubkey]) {
      getHub({ hubPubkey })
    }
  }, [hubPubkey, getHub])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && !metadata) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState, metadata, releasePubkey])
  console.log("metadata, releasePubkey, releaseState ::> ", metadata, releasePubkey, releaseState)
  return (
    <>
      <BackButton onClick={() => router.back()} />

      <DesktopImageGridItem item md={6}>
        {metadata && (
          <ImageContainer>
            <Image
              src={metadata?.image}
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
      <Grid
        item
        md={6}
        xs={12}
        sx={{
          padding: '0px',
        }}
      >
        {metadata && (
          <>
            <MobileImageWrapper>
              <Image
                src={metadata?.image}
                layout="responsive"
                objectFit="contain"
                objectPosition={'center'}
                height={100}
                width={100}
                alt={metadata.description || 'album art'}
              />
            </MobileImageWrapper>
            <Typography
              variant="h3"
              align="left"
              sx={{ color: 'text.primary' }}
              mt={1}
            >
              {metadata.properties.artist} - {metadata.properties.title} (
              <PlayButton
                onClick={(e) => {
                  e.stopPropagation()
                  updateTrack(
                    releasePubkey,
                    !(isPlaying && track.releasePubkey === releasePubkey)
                  )
                }}
              >
                {isPlaying && track.releasePubkey === releasePubkey
                  ? 'Pause'
                  : 'Play'}
              </PlayButton>
              )
            </Typography>
            {/* <StyledDescription variant="h4" align="left">{metadata.description}</StyledDescription> */}
          </>
        )}
        <ReleasePurchase
          releasePubkey={releasePubkey}
          metadata={metadata}
          inPost={true}
        />
      </Grid>
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

const StyledDescription = styled(Typography)(({ theme }) => ({
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    maxHeight: '225px',
    overflowY: 'scroll',
  },
}))

const DesktopImageGridItem = styled(Grid)(({ theme }) => ({
  // padding: '0 !important',
  // height: '100%',
  // position: 'relative',
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

const BackButton = styled(ArrowBackIosIcon)(({ theme }) => ({
  width: '30px',
  height: '30px',
  position: 'absolute',
  zIndex: '1000000',
  top: '15px',
  left: '15px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

export default PostRelease
