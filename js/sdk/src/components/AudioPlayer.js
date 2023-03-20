import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'

const AudioPlayer = ({ hubPubkey = undefined, children }) => {
  const audio = useContext(Audio.Context)
  const { releaseState } = useContext(Release.Context)

  const {
    track,
    playNext,
    playPrev,
    updateTrack,
    playlist,
    isPlaying,
    initialized,
    setInitialized,
    audioPlayerRef,
    activeIndexRef,
  } = audio

  const activeTrack = useRef()
  const intervalRef = useRef()
  const [playing, setPlaying] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0.0)
  const [duration, setDuration] = useState(0)
  const audioInitialized = useMemo(() => initialized, [initialized])
  const [authority, setAuthority] = useState(undefined)

  useEffect(() => {
    audioPlayerRef.current = document.querySelector('#audio')
    audioPlayerRef.current.addEventListener('error', (e) => {
      if (e.target.error.code === e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        if (audioPlayerRef.current.src.includes('arweave.net')) {
          audioPlayerRef.current.src = activeTrack.current.txid.replace(
            'arweave.net',
            'ar-io.net'
          )
          play()
        }
      }
    })

    audioPlayerRef.current.addEventListener('play', function () {
      navigator.mediaSession.playbackState = 'playing'
    })

    audioPlayerRef.current.addEventListener('pause', function () {
      navigator.mediaSession.playbackState = 'paused'
    })

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isPlaying && audioInitialized) {
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
    if (track && audioInitialized) {
      updateMediaSession()
      if (audioPlayerRef.current.src !== track.txid) {
        activeTrack.current = track
        audioPlayerRef.current.src = track.txid
      }
    }
    if (audioInitialized && isPlaying) {
      play()
    }
  }, [track, audioInitialized])

  useEffect(() => {
    if (track) {
      setAuthority(releaseState?.tokenData[track?.releasePubkey]?.authority)
    }
  }, [authority, track])

  useEffect(() => {
    if (
      playlist.length > 0 &&
      !activeIndexRef.current &&
      track?.releasePubkey != playlist[0].releasePubkey &&
      !isPlaying
    ) {
      updateTrack(playlist[0].releasePubkey, false)
    }
  }, [playlist, activeIndexRef.current, isPlaying])

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (
        audioPlayerRef.current.currentTime > 0 &&
        audioPlayerRef.current.currentTime < audioPlayerRef.current.duration &&
        !audioPlayerRef.current.paused
      ) {
        setDuration(audioPlayerRef.current.duration)
        setTrackProgress(Math.ceil(audioPlayerRef.current.currentTime))
        updatePositionState()
      } else if (
        audioPlayerRef.current.currentTime >= audioPlayerRef.current.duration
      ) {
        next()
      }
    }, [300])
  }

  const previous = () => {
    if (hasPrevious) {
      setTrackProgress(0)
      playPrev(true)
    }
  }

  const play = () => {
    if (audioPlayerRef.current.paused) {
      if (audioPlayerRef.current.src) {
        audioPlayerRef.current.play()
      }
      setPlaying(true)
      startTimer()
    }
  }

  const pause = () => {
    audioPlayerRef.current.pause()
    setPlaying(false)
    clearInterval(intervalRef.current)
    if (track) {
      updateTrack(track.releasePubkey, false)
    }
  }

  const next = () => {
    if (hasNext) {
      setTrackProgress(0)
      playNext(true)
    } else {
      // This means we've reached the end of the playlist
      setTrackProgress(0)
      pause()
    }
  }

  const seek = (newValue) => {
    if (audioPlayerRef.current) {
      setTrackProgress(newValue)
      audioPlayerRef.current.currentTime = newValue
    }
  }

  const playButtonHandler = () => {
    if (!initialized) {
      setInitialized(true)
    }
    if (audioPlayerRef.current.paused) {
      if (track) {
        updateTrack(track.releasePubkey, true, hubPubkey)
      }
    } else {
      pause()
    }
  }

  const updateMediaSession = () => {
    const actionHandlers = [
      ['play', play],
      ['pause', pause],
      ['nexttrack', next],
      ['previoustrack', previous],
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

    if (track && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: [
          {
            src: track.cover,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      })
    }
  }

  function updatePositionState() {
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: audioPlayerRef.current.duration,
        playbackRate: audioPlayerRef.current.playbackRate,
        position: audioPlayerRef.current.currentTime,
      })
    }
  }

  return (
    <div>
      <audio id="audio" style={{ width: '100%' }} preload="none">
        <source src={track?.txid + '?ext=mp3'} type="audio/mp3" />
      </audio>
      {children({
        track,
        playButtonHandler,
        previous,
        next,
        seek,
        authority,
        trackProgress,
        duration,
        playing,
        hasNext,
        hasPrevious,
        playlist,
      })}
    </div>
  )
}

export default AudioPlayer
