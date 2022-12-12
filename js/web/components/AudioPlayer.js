import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { formatDuration } from '@nina-protocol/nina-internal-sdk/esm/utils'
import { imageManager } from '@nina-protocol/nina-internal-sdk/esm/utils'
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
const AudioPlayer = () => {
  const audio = useContext(Audio.Context)
  const {
    track,
    playNext,
    playPrev,
    updateTrack,
    playlist,
    isPlaying,
    currentIndex,
  } = audio

  const activeTrack = useRef()
  const playerRef = useRef()
  const intervalRef = useRef()
  const activeIndexRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0.0)
  const [duration, setDuration] = useState(0)
  useEffect(() => {
    playerRef.current = document.querySelector('#audio')

    const actionHandlers = [
      ['play', () => play()],
      ['pause', () => play()],
      ['previoustrack', () => previous()],
      ['nexttrack', () => next()],
    ]

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch (error) {
        console.warn(
          `The media session action "${action}" is not supported yet.`
        )
      }
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    const initialized = activeIndexRef.current >= 0
    if (isPlaying && initialized) {
      play()
    } else {
      pause()
    }
  }, [isPlaying])

  const hasNext = useMemo(
    () => activeIndexRef.current + 1 < playlist.length,
    [activeIndexRef.current, playlist]
  )
  const hasPrevious = useMemo(
    () => activeIndexRef.current > 0,
    [activeIndexRef.current]
  )

  useEffect(() => {
    const initialized = activeIndexRef.current >= 0
    if (track) {
      activeIndexRef.current = playlist.indexOf(track)
      activeTrack.current = track
      playerRef.current.src = track.txid
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeTrack.current.title,
          artist: activeTrack.current.artist,
          artwork: [
            {
              src: activeTrack.current.cover,
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ],
        })
      }
    }
    if (initialized && isPlaying) {
      play()
    }
  }, [track])

  useEffect(() => {
    if (
      playlist.length > 0 &&
      !activeIndexRef.current &&
      track?.releasePubkey != playlist[0].releasePubkey
    ) {
      updateTrack(playlist[0].releasePubkey, false)
    }
  }, [playlist, activeIndexRef.current])

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (
        playerRef.current.currentTime > 0 &&
        playerRef.current.currentTime < playerRef.current.duration &&
        !playerRef.current.paused
      ) {
        setDuration(playerRef.current.duration)
        setTrackProgress(Math.ceil(playerRef.current.currentTime))
      } else if (playerRef.current.currentTime >= playerRef.current.duration) {
        next()
      }
    }, [300])
  }

  const previous = () => {
    if (hasPrevious) {
      setTrackProgress(0)
      activeIndexRef.current = activeIndexRef.current - 1
      playPrev(true)
    }
  }

  const play = () => {
    if (playerRef.current.paused) {
      playerRef.current.play()
      setPlaying(true)
      startTimer()
    } else {
      // pause()
    }
  }

  const playButtonHandler = () => {
    if (playerRef.current.paused) {
      if (track) {
        updateTrack(track.releasePubkey, true)
      }
    } else {
      pause()
    }
  }

  const pause = () => {
    playerRef.current.pause()
    setPlaying(false)
    clearInterval(intervalRef.current)
    if (track) {
      updateTrack(track.releasePubkey, false)
    }
  }

  const next = () => {
    if (hasNext) {
      setTrackProgress(0)
      activeIndexRef.current = activeIndexRef.current + 1
      playNext(true)
    } else {
      // This means we've reached the end of the playlist
      setTrackProgress(0)
      pause()
    }
  }

  const seek = (newValue) => {
    if (playerRef.current) {
      setTrackProgress(newValue)
      playerRef.current.currentTime = newValue
    }
  }

  const iconStyle = {
    width: '60px',
    height: '60px',
    cursor: 'pointer',
  }
  return (
    <StyledAudioPlayer>
      <audio id="audio" style={{ width: '100%' }}>
        <source src={track?.txid + '?ext=mp3'} type="audio/mp3" />
      </audio>

      <Box width="60px">
        {track && (
          <Link href={`/${track.releasePubkey}`} passHref>
            <AlbumArt>
              <Image
                src={getImageFromCDN(track.cover, 100)}
                loader={loader}
                height="60px"
                width="60px"
                layout="responsive"
              />
            </AlbumArt>
          </Link>
        )}
      </Box>

      <Controls>
        <IconButton
          disabled={!currentIndex()}
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
          {isPlaying ? (
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
          disabled={
            currentIndex() + 1 === playlist.length || playlist.length <= 1
          }
          disableFocusRipple={true}
          disableRipple={true}
        >
          <SkipNextIcon onClick={() => next()} sx={iconStyle} />
        </IconButton>
      </Controls>

      <ProgressContainer>
        {track && (
          <ArtistInfo align="left" variant="subtitle1">
            <Link href={`/hubs/${track.hub}`} passHref>
              <ReleaseArtist>{track.artist}, </ReleaseArtist>
            </Link>

            <Link href={`/${track.releasePubkey}`} passHref>
              <ReleaseTitle>{track.title}</ReleaseTitle>
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
        {formatDuration(trackProgress) || '00:00'}
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

export default AudioPlayer
