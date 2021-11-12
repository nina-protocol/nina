import React, { useState, useEffect, useContext, useRef } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
// import SvgIcon from '@mui/material/SvgIcon';
import shareArrow from '../assets/shareArrow.png'
// import VolumeUpIcon from '@mui/icons-material/VolumeUp'
// import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { Typography } from '@mui/material'
import QueDrawer from './QueDrawer'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const AudioPlayer = () => {
  const { txid, updateTxid, playlist } = useContext(AudioPlayerContext)
  const wallet = useWallet()
  let playerRef = useRef()
  const intervalRef = useRef()
  const playlistRef = useRef([])
  // const [volume, setVolume] = useState(0.8)
  // const [muted, setMuted] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [info, setInfo] = useState(null)
  const [nextInfo, setNextInfo] = useState(null)

  useEffect(() => {
    playerRef.current = document.querySelector('#audio')

    return () => {
      playerRef.current.pause()
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (playlistRef.current.length > 0) {
      changeTrack(txid)
      let index = currentIndex()
      if (index === undefined) {
        setInfo(playlistRef.current[playlistRef.current.length - 1])
        setNextInfo(playlistRef.current[playlistRef.current.length])
      } else {
        setInfo(playlistRef.current[index])
        setNextInfo(playlistRef.current[index + 1])
      }
    }
  }, [txid])

  useEffect(() => {
    const shouldSetInfoOnInitialPlaylistLoad = playlistRef.current.length === 0
    playlistRef.current = playlist

    if (shouldSetInfoOnInitialPlaylistLoad && playlistRef.current.length > 0) {
      setInfo(playlistRef.current[0])
      if (!wallet?.connected && playlistRef.current[0]) {
        changeTrack(playlistRef.current[0].txid)
      }
    } else if (
      playlist.filter((playlistItem) => playlistItem.txid === info.txid)
        .length === 0
    ) {
      setIsPlaying(false)
      if (playlistRef.current[0]) {
        setInfo(playlistRef.current[0])
        setNextInfo(playlistRef.current[1])
      } else {
        setInfo(null)
        setDuration(0)
      }
      setTrackProgress(0)
      clearInterval(intervalRef.current)
    }
  }, [playlist])

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDuration(playerRef.current?.duration)

      if (playerRef.current.duration > 0 && !playerRef.current.paused) {
        setIsPlaying(true)
        setTrackProgress(Math.ceil(playerRef.current.currentTime))
      } else if (playerRef.current.currentTime > 0) {
        setIsPlaying(false)
        setTrackProgress(0)
        playNextTrack()
      }
    }, [1000])
  }

  const changeTrack = async (txid) => {
    playerRef.current.src = txid
    playerRef.current.play()
    startTimer()
  }

  const togglePlay = () => {
    if (
      playerRef.current &&
      txid &&
      playerRef.current.duration > 0 &&
      !playerRef.current.paused
    ) {
      clearInterval(intervalRef.current)
      playerRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!txid) {
        updateTxid(playlistRef.current[0].txid)
        setIsPlaying(true)
      } else {
        setIsPlaying(true)
        startTimer()
        playerRef.current.play()
      }
    }
  }

  const currentIndex = () => {
    let index = undefined
    playlistRef.current.forEach((item, i) => {
      if (item.txid === txid) {
        index = i
        return
      }
    })
    return index
  }

  const playNextTrack = () => {
    let index = currentIndex()
    setTrackProgress(0)
    if (index >= 0) {
      const next = playlistRef.current[index + 1]
      if (next) {
        updateTxid(next.txid)
      }
    }
  }

  const playPreviousTrack = () => {
    let index = currentIndex()
    setTrackProgress(0)

    if (index) {
      const prev = playlistRef.current[index - 1]
      if (prev) {
        updateTxid(prev.txid)
      }
    }
  }

  const seek = (newValue) => {
    if (playerRef.current) {
      setTrackProgress(newValue)
      playerRef.current.currentTime = newValue
    }
  }

  // const volumeChange = (newValue) => {
  //   setVolume(newValue)
  //   if (playerRef.current) {
  //     playerRef.current.volume = muted ? 0 : newValue
  //   }
  // }

  // const mute = () => {
  //   if (playerRef.current) {
  //     playerRef.current.volume = !muted ? 0 : volume
  //     setMuted(!muted)
  //   }
  // }

  // const emptyPlayerString = wallet?.connected
  //   ? `You don't own any songs`
  //   : `Connect you wallet to listen to your collection`

  const iconStyle = {
    width: '40px',
    height: '40px',
    cursor: 'pointer',
  }

  return (
    <StyledAudioPlayer>
      <audio id="audio" style={{ width: '100%' }}>
        <source src={txid} type="audio/mp3" />
      </audio>

      {info && (
        <AlbumArt to={`/releases/${info.releasePubkey}`}>
          <img src={info.cover} style={{ height: '60px', width: '60px' }} />
        </AlbumArt>
      )}

      <Controls>
        <SkipPreviousRoundedIcon
          onClick={() => playPreviousTrack()}
          sx={iconStyle}
        />
        {isPlaying ? (
          <PauseRoundedIcon onClick={() => togglePlay()} sx={iconStyle} />
        ) : (
          <PlayArrowRoundedIcon onClick={() => togglePlay()} sx={iconStyle} />
        )}
        <SkipNextRoundedIcon onClick={() => playNextTrack()} sx={iconStyle} />
      </Controls>

      <ProgressContainer>
        {info && (
          <Typography align="left" variant="subtitle1">
            {info.artist}, <i>{info.title}</i>
          </Typography>
        )}
        <Slider
          value={txid ? trackProgress : 0}
          onChange={(e, newValue) => seek(newValue)}
          aria-labelledby="continuous-slider"
          min={0}
          max={duration}
        />
      </ProgressContainer>

      <Typography sx={{ padding: '0 30px' }} variant="subtitle1">
        {NinaClient.formatDuration(trackProgress) || '00:00'}
      </Typography>

      {info && (
        <>
          <Link
            to={`/releases/${info.releasePubkey}`}
            style={{ marginRight: '30px' }}
          >
            <Typography variant="subtitle1" sx={{ padding: '0' }}>
              View Info
            </Typography>
          </Link>

          {/* Change the arrow to svg */}
          <Link
            to={`/releases/${info.releasePubkey}`}
            style={{ display: 'flex' }}
          >
            <img src={shareArrow}></img>
          </Link>
        </>
      )}

      {/* <VolumeContainer>
        {muted && (
          <VolumeOffIcon
            className={`${classes.player}__button  ${classes.player}__button--volume-mute`}
            onClick={() => mute(false)}
          />
        )}
        {!muted && (
          <VolumeUpIcon
            className={`${classes.player}__button ${classes.player}__button--volume-mute`}
            onClick={() => mute(true)}
          />
        )}

        <Slider
          className="player__volume"
          value={muted ? 0 : volume}
          onChange={(e, newValue) => volumeChange(newValue)}
          aria-labelledby="continuous-slider"
          min={0}
          step={0.01}
          max={1.0}
        />
      </VolumeContainer> */}

      <QueDrawer
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        nextInfo={nextInfo}
      />
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
  boxShadow: `0px -1px 9px 5px rgba(0,0,0,0.08)`,
  background: `${theme.palette.white}`,
  display: 'flex',
  zIndex: '100',
}))

const AlbumArt = styled(Link)(() => ({
  width: '60px',
  height: '60px',
}))

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
}))

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '250px',
  height: '28px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  paddingRight: theme.spacing(2),
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

// const VolumeContainer = styled(Box)(() => ({
//   border: '2px solid blue',
//   width: '100px'
// }))

export default AudioPlayer
