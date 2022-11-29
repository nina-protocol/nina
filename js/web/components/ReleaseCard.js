import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Image from 'next/image'

import AddToHubModal from './AddToHubModal.js'
import Link from 'next/link'
const { getImageFromCDN, loader } = imageManager

const ReleaseCard = (props) => {
  const {
    artwork,
    metadata,
    preview,
    publicKey,
    releasePubkey,
    userHubs,
    release,
  } = props
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)
  const image = useMemo(() => metadata?.image)
  return (
    <StyledReleaseCard>
      <StyledReleaseInfo>
        {metadata && (
          <CtaWrapper>
            <Box>
              <Button
                onClickCapture={() => {
                  if (isPlaying && track.releasePubkey === releasePubkey) {
                    setIsPlaying(false)
                  } else {
                    updateTrack(releasePubkey, true, true)
                  }
                }}
                sx={{ height: '22px', width: '28px' }}
              >
                {isPlaying && track.releasePubkey === releasePubkey ? (
                  <PauseCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
                ) : (
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
                )}
              </Button>
              <Button
                onClick={() => {
                  addTrackToQueue(releasePubkey)
                }}
                sx={{ height: '22px', width: '28px' }}
              >
                <ControlPointIcon sx={{ color: 'white' }} />
              </Button>
            </Box>

            {releasePubkey && (
              <Box>
                <AddToHubModal
                  userHubs={userHubs}
                  releasePubkey={releasePubkey}
                  metadata={metadata}
                />
              </Box>
            )}
          </CtaWrapper>
        )}

        {metadata && (
          <Fade in={true}>
            <Typography variant="h4" color="white" align="left">
              <Link href={`/profiles/${release?.authority}`}>
                <a style={{ color: 'white' }}>
                  {metadata?.properties?.artist.substring(0, 100) ||
                    metadata?.artist.substring(0, 100)}
                </a>
              </Link>
              ,{' '}
              <i>
                {metadata?.properties?.title.substring(0, 100) ||
                  metadata?.title.substring(0, 100)}
              </i>
            </Typography>
          </Fade>
        )}
      </StyledReleaseInfo>

      <Box>
        {preview && (
          <Image
            src={
              artwork?.meta.status === undefined ? '' : artwork.meta.previewUrl
            }
            alt={metadata.artist}
            layout="responsive"
            height={350}
            width={350}
            priority={true}
          />
        )}
        {!preview && metadata && release && (
          <Image
            height={350}
            width={350}
            layout="responsive"
            src={getImageFromCDN(
              image,
              400,
              new Date(release.releaseDatetime)
            )}
            alt={metadata?.name}
            priority={true}
            loader={loader}
          />
        )}
      </Box>
    </StyledReleaseCard>
  )
}

const StyledReleaseCard = styled(Box)(() => ({
  width: '100%',
  minHeight: '100%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}))

const CtaWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  '& .MuiButton-root': {
    width: '21px',
    marginRight: '10px',
  },
}))

const StyledReleaseInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.blue,
  color: theme.palette.white,
  minHeight: '52px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    minHeight: '52px',
    height: 'unset',
    paddingBottom: '15px',
  },
}))

export default ReleaseCard
