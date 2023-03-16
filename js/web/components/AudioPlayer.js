import React from 'react'
import { styled } from '@mui/material/styles'
import { formatDuration } from '@nina-protocol/nina-internal-sdk/esm/utils'
import { imageManager } from '@nina-protocol/nina-internal-sdk/esm/utils'
import AudioPlayer from '@nina-protocol/nina-internal-sdk/esm/AudioPlayer'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import IconButton from '@mui/material/IconButton'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import QueueDrawer from './QueueDrawer'

const { getImageFromCDN, loader } = imageManager
const WebAudioPlayer = () => {
  const iconStyle = {
    width: '60px',
    height: '60px',
    cursor: 'pointer',
  }
  return (
    <AudioPlayer>
      {({
        track,
        playButtonHandler,
        previous,
        next,
        seek,
        authority,
        trackProgress,
        duration,
        hasNext,
        hasPrevious,
        playing,
        playlist,
      }) => (
        <StyledAudioPlayer>
          <Box width="60px">
            {track && (
              <Link href={`/${track.releasePubkey}`} passHref>
                <a>
                  <AlbumArt>
                    <Image
                      src={getImageFromCDN(track.cover, 100)}
                      loader={loader}
                      height="60px"
                      width="60px"
                      layout="responsive"
                    />
                  </AlbumArt>
                </a>
              </Link>
            )}
          </Box>

          <Controls>
            <IconButton
              disabled={!hasPrevious}
              disableFocusRipple={true}
              disableRipple={true}
            >
              <SkipPreviousIcon onClick={() => previous()} sx={iconStyle} />
            </IconButton>
            <IconButton
              disabled={playlist.length === 0}
              disableFocusRipple={true}
              disableRipple={true}
            >
              {playing ? (
                <PauseIcon
                  onClickCapture={() => playButtonHandler()}
                  sx={iconStyle}
                />
              ) : (
                <PlayArrowIcon
                  onClickCapture={() => playButtonHandler()}
                  sx={iconStyle}
                />
              )}
            </IconButton>
            <IconButton
              disabled={!hasNext}
              disableFocusRipple={true}
              disableRipple={true}
            >
              <SkipNextIcon onClick={() => next()} sx={iconStyle} />
            </IconButton>
          </Controls>

          <ProgressContainer>
            {track && (
              <ArtistInfo align="left" variant="subtitle1">
                <Link href={`/profiles/${authority}`} passHref>
                  <a>
                    <ReleaseArtist>{track.artist}, </ReleaseArtist>
                  </a>
                </Link>

                <Link href={`/${track.releasePubkey}`} passHref>
                  <a>
                    <ReleaseTitle>{track.title}</ReleaseTitle>
                  </a>
                </Link>
              </ArtistInfo>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Slider
                value={track ? trackProgress : 0}
                onChange={(e, newValue) => seek(newValue)}
                aria-labelledby="continuous-slider"
                min={0}
                max={track?.duration || duration}
              />

              <Typography
                sx={{ padding: '0 10px', display: { xs: 'block', md: 'none' } }}
                variant="subtitle1"
              >
                {formatDuration(trackProgress) || '00:00'}
              </Typography>
            </Box>
          </ProgressContainer>

          <Typography
            sx={{ padding: '0 30px', display: { xs: 'none', md: 'block' } }}
            variant="subtitle1"
          >
            {formatDuration(trackProgress) || '00:00'} /{' '}
            {formatDuration(duration)}
          </Typography>

          {track && (
            <LinkWrapper>
              <Link
                href={`/${track.releasePubkey}`}
                style={{ marginRight: '30px' }}
                passHref
              >
                <a>
                  <Typography variant="subtitle1" sx={{ padding: '0' }}>
                    View Info
                  </Typography>
                </a>
              </Link>

              <Button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${`${track.artist} - "${track.title}" on Nina`}&url=ninaprotocol.com/${
                      track.releasePubkey
                    }`,
                    null,
                    'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
                  )
                }
                disableFocusRipple={true}
                disableRipple={true}
              >
                <Image src={'/shareArrow.svg'} width="15px" height="15px" />
              </Button>
            </LinkWrapper>
          )}
          <QueueDrawer />
        </StyledAudioPlayer>
      )}
    </AudioPlayer>
  )
}

const StyledAudioPlayer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '0',
  width: '100%',
  height: '60px',
  maxWidth: '100vw',
  alignItems: 'center',
  boxShadow: `0px -1px 5px 0px rgba(0,0,0,0.06)`,

  background: `${theme.palette.white}`,
  display: 'flex',
  zIndex: '100',
}))

const AlbumArt = styled('a')(() => ({
  width: '60px',
  height: '60px',
}))

const ReleaseArtist = styled('a')(() => ({
  cursor: 'pointer',
}))

const ReleaseTitle = styled('a')(() => ({
  fontStyle: 'italic',
  cursor: 'pointer',
}))

const ArtistInfo = styled(Typography)(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    whiteSpace: 'wrap',
  },
}))

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  '& svg': {
    height: '24px',
    width: '24px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '10px',
    paddingRight: '0',
  },
}))

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '250px',
  height: '48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '100px',
    padding: theme.spacing(0, 1),
  },
  '& .MuiSlider-root': {
    height: '7px',
    padding: '0',
    '& .MuiSlider-thumb': {
      color: theme.palette.blue,
      width: '14px',
      height: '11px',
    },
    '& .MuiSlider-track': {
      color: theme.palette.greyLight,
      height: '7px',
      border: 'none',
    },
    '& .MuiSlider-rail': {
      color: theme.palette.greyLight,
      height: '7px',
    },
  },
}))

const LinkWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  '& img': {
    height: '17px',
    width: '17px',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

export default WebAudioPlayer
