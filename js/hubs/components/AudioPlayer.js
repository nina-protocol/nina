import React, { useEffect, useState, useRef, useContext, useMemo } from 'react'
import nina from '@nina-protocol/nina-sdk'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'

const { AudioPlayerContext, HubContext, ReleaseContext } = nina.contexts
const { formatDuration } = nina.utils
const AudioPlayer = () => {
  const router = useRouter()
  const hubPubkey = router.query.hubPubkey
  const { releaseState } = useContext(ReleaseContext)
  const { hubContentState, filterHubContentForHub } = useContext(HubContext)
  const audio = useContext(AudioPlayerContext)
  const {
    track,
    playNext,
    playPrev,
    updateTrack,
    playlist,
    createPlaylistFromTracksHubs,
    isPlaying,
  } = audio
  const tracks = useMemo(() => {
    const trackObject = {}
    const [hubReleases] = filterHubContentForHub(hubPubkey)
    hubReleases.forEach((hubRelease) => {
      let contentItem
      if (
        hubRelease.contentType === 'NinaReleaseV1' &&
        releaseState.metadata[hubRelease.release] &&
        hubRelease.visible
      ) {
        contentItem = releaseState.metadata[hubRelease.release]
        contentItem.contentType = hubRelease.contentType
        contentItem.publicKey = hubRelease.release
        contentItem.datetime = hubRelease.datetime
        trackObject[hubRelease.release] = contentItem
      }
    })
    console.log('FFFF: ', trackObject)
    return trackObject
  }, [hubContentState])
  const activeTrack = useRef()
  const playerRef = useRef()
  const intervalRef = useRef()
  const hasPrevious = useRef(false)
  const hasNext = useRef(false)
  const activeIndexRef = useRef()
  const [playing, setPlaying] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0.0)

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
    if (Object.values(tracks).length > 1) {
      const trackIds = Object.values(tracks)
        .sort((a, b) => b.datetime - a.datetime)
        .map((track) => track.publicKey)
      createPlaylistFromTracksHubs(trackIds)
    }
  }, [tracks])

  useEffect(() => {
    const initialized = activeIndexRef.current >= 0
    if (isPlaying && initialized) {
      play()
    } else {
      pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const initialized = activeIndexRef.current >= 0
    if (track) {
      activeIndexRef.current = playlist.indexOf(track)
      activeTrack.current = track
      hasNext.current = activeIndexRef.current + 1 < playlist.length
      hasPrevious.current = activeIndexRef.current > 0
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
    if (playlist.length > 0 && !activeIndexRef.current) {
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
        setTrackProgress(Math.ceil(playerRef.current.currentTime))
      } else if (playerRef.current.currentTime >= playerRef.current.duration) {
        next()
      }
    }, [300])
  }

  const previous = () => {
    if (hasPrevious.current) {
      setTrackProgress(0)
      activeIndexRef.current = activeIndexRef.current - 1
      playPrev(true)
    }
  }

  const play = () => {
    if (playerRef.current.paused) {
      playerRef.current.play()
      if (!playerRef.current.paused) {
        setPlaying(true)
        startTimer()
      }
    } else {
      pause()
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
      updateTrack(track.releasePubkey)
    }
  }

  const next = () => {
    if (hasNext.current) {
      setTrackProgress(0)
      activeIndexRef.current = activeIndexRef.current + 1
      playNext(true)
    } else {
      // This means we've reached the end of the playlist
      setPlaying(false)
    }
  }

  return (
    <Player>
      {track && (
        <>
          <Controls>
            <Button onClick={() => previous()} disabled={!hasPrevious.current}>
              Previous
            </Button>
            <span>{` | `}</span>
            <Button onClick={() => playButtonHandler()} disabled={!track}>
              {playing ? 'Pause' : 'Play'}
            </Button>
            <span>{` | `}</span>
            <Button onClick={() => next()} disabled={!hasNext.current}>
              Next
            </Button>
            {track && (
              <div>
                <Typography>{`Now Playing: ${track.artist} - ${track.title}`}</Typography>
                <Typography>{`${formatDuration(
                  trackProgress
                )} / ${formatDuration(track.duration)}`}</Typography>
              </div>
            )}
          </Controls>
          <Typography>
            <a
              href={`https://ninaprotocol.com/hubs/${hubPubkey || ''}`}
              target="_blank"
              rel="noreferrer"
            >
              Powered by Nina.
            </a>
          </Typography>
        </>
      )}
      <audio id="audio" style={{ width: '100%' }}>
        <source src={track?.txid} type="audio/mp3" />
      </audio>
    </Player>
  )
}

const Controls = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  width: '100%',
  '& .MuiButton-root': {
    fontSize: theme.typography.body1.fontSize,
    padding: 0,
    color: theme.palette.text.primary,
    ':hover': {
      opacity: '50%',
    },
    ':disabled': {
      color: theme.palette.text.primary + 'a0',
    },
  },
}))

const Player = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.down('md')]: {
    position: 'fixed',
    bottom: '0',
    width: '100vw',
    background: theme.palette.white,
    paddingTop: '0',
  },
  '& .MuiButton-root': {
    fontSize: theme.typography.body1.fontSize,
    backgroundColor: `${theme.palette.transparent} !important`,
    padding: 0,
    color: theme.palette.text.primary,
    ':disabled': {
      color: theme.palette.text.primary + 'b0',
    },
  },
  '& a': {
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
}))

export default AudioPlayer
