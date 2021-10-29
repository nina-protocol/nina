import React, { useState, useEffect, useContext, useRef } from 'react'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Link } from 'react-router-dom'
import Slider from '@material-ui/core/Slider'
import SkipNextRoundedIcon from '@material-ui/icons/SkipNextRounded'
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded'
import PauseRoundedIcon from '@material-ui/icons/PauseRounded'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import PlaylistDrawer from './PlaylistDrawer'

const { AudioPlayerContext } = ninaCommon.contexts

const AudioPlayer = () => {
  const classes = useStyles()
  const theme = useTheme()
  const { txid, updateTxid, playlist } = useContext(AudioPlayerContext)
  const wallet = useWallet()
  let playerRef = useRef()
  const intervalRef = useRef()
  const playlistRef = useRef([])
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [info, setInfo] = useState(null)

  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - hours * 3600) / 60)
    var seconds = sec_num - hours * 3600 - minutes * 60

    if (minutes < 10) {
      minutes = '0' + minutes
    }
    if (seconds < 10) {
      seconds = '0' + seconds
    }
    return minutes + ':' + seconds
  }

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
      } else {
        setInfo(playlistRef.current[index])
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

  const volumeChange = (newValue) => {
    setVolume(newValue)
    if (playerRef.current) {
      playerRef.current.volume = muted ? 0 : newValue
    }
  }

  const mute = () => {
    if (playerRef.current) {
      playerRef.current.volume = !muted ? 0 : volume
      setMuted(!muted)
    }
  }

  const emptyPlayerString = wallet?.connected
    ? `You don't own any songs`
    : `Connect you wallet to listen to your collection`

  return (
    <div style={theme.helpers.grid} className={`${classes.player}`}>
      <audio id="audio" style={{ width: '100%' }}>
        <source src={txid} type="audio/mp3" />
      </audio>

      <PlaylistDrawer isPlaying={isPlaying} togglePlay={togglePlay} />

      {info && (
        <div className={`${classes.player}__info`}>
          <Link style={{ width: '20%' }} to={`/release/${info.releasePubkey}`}>
            <img style={{ height: '3rem' }} src={info.cover} />
          </Link>

          <div className={`${classes.player}__copy`}>
            <p className={`${classes.player}__copy-line`}>{info.artist}</p>
            <p className={`${classes.player}__copy-line`}>{info.title}</p>
          </div>
        </div>
      )}

      {!info && (
        <div className={`${classes.player}__info`}>
          <div className={`${classes.player}__copy-line`}>
            <p className={`${classes.player}__copy-line--connect`}>
              {emptyPlayerString}
            </p>
          </div>
        </div>
      )}

      <div className={`${classes.player}__progress-container`}>
        <div
          className={`${classes.player}__time ${classes.player}__time--elapsed`}
        >
          <span>{trackProgress.toString().toHHMMSS() || '00:00'}</span>
        </div>

        <Slider
          className="player__progress"
          value={txid ? trackProgress : 0}
          onChange={(e, newValue) => seek(newValue)}
          aria-labelledby="continuous-slider"
          min={0}
          max={duration}
        />

        <div
          className={`${classes.player}__time ${classes.player}__time--duration`}
        >
          <span>{info?.duration?.toString().toHHMMSS() || '00:00'}</span>
        </div>
      </div>

      <div className={`${classes.player}__controls`}>
        <SkipPreviousRoundedIcon
          className={`${classes.player}__button`}
          onClick={() => playPreviousTrack()}
        />
        {isPlaying ? (
          <PauseRoundedIcon
            className={`${classes.player}__button`}
            onClick={() => togglePlay()}
          />
        ) : (
          <PlayArrowRoundedIcon
            className={`${classes.player}__button`}
            onClick={() => togglePlay()}
          />
        )}
        <SkipNextRoundedIcon
          className={`${classes.player}__button ${classes.player}__button--next`}
          onClick={() => playNextTrack()}
        />
        <Slider
          className="player__volume"
          value={muted ? 0 : volume}
          onChange={(e, newValue) => volumeChange(newValue)}
          aria-labelledby="continuous-slider"
          min={0}
          step={0.01}
          max={1.0}
        />
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
      </div>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  player: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '100vw',
    alignItems: 'center',
    gridTemplateColumns: '10% 20% 45% 1fr',
    boxShadow: `0px -1px 9px 5px rgba(0,0,0,0.08)`,
    background: `${theme.vars.white}`,
    '&__info': {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    '&__copy': {
      textAlign: 'left',
      width: '80%',
      paddingLeft: '1rem',
      '&-line': {
        margin: '0',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        '&--connect': {
          whiteSpace: 'pre-line',
          textAlign: 'center',
        },
      },
    },
    '&__progress-container': {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    '&__controls': {
      display: 'flex',
      justifyContent: 'space-around',
      width: '90%',
      padding: '0.5rem 0.5rem 0.5rem 0',
      fontSize: '3rem',
      alignItems: 'center',
    },
    '&__button': {
      fontSize: '2rem',
      padding: '0.5rem 0',
      color: `${theme.vars.purple}`,
      cursor: 'pointer',
      '&--next': {
        paddingRight: '1rem',
      },
      '&--volume-mute': {
        paddingLeft: '16px',
      },
    },
    '&__time': {
      width: '4rem',
      '&--elapsed': {
        paddingRight: '1rem',
      },
      '&--duration': {
        paddingLeft: '1rem',
      },
    },
  },
}))

export default AudioPlayer
