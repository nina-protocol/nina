import React, { useState, useEffect, useContext, useRef } from "react";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import IconButton from "@mui/material/IconButton";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
// import SvgIcon from '@mui/material/SvgIcon';
// import VolumeUpIcon from '@mui/icons-material/VolumeUp'
// import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import Typography from "@mui/material/Typography";
import QueueDrawer from "./QueueDrawer";
import Image from "./Image";

const { AudioPlayerContext } = ninaCommon.contexts;
const { NinaClient } = ninaCommon.utils;

const AudioPlayer = () => {
  const { txid, updateTxid, playlist, isPlaying, setIsPlaying, currentIndex } =
    useContext(AudioPlayerContext);
  const wallet = useWallet();
  let playerRef = useRef();
  const intervalRef = useRef();
  const playlistRef = useRef([]);
  // const [volume, setVolume] = useState(0.8)
  // const [muted, setMuted] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [info, setInfo] = useState(null);
  const [shouldPlay, setShouldPlay] = useState();

  useEffect(() => {
    playerRef.current = document.querySelector("#audio");

    return () => {
      playerRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      clearInterval(intervalRef.current);
      playerRef.current.pause();
      setShouldPlay(false);
    } else {
      setShouldPlay(true);
      if (!txid) {
        updateTxid(
          playlistRef.current[0].txid,
          playlistRef.current[0].releasePubkey,
          true
        );
      } else {
        startTimer();
        if (playerRef.current.src !== txid + "?ext=mp3") {
          playerRef.current.src = txid + "?ext=mp3";
        }
        playerRef.current.play();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    let index = currentIndex();
    if (playlistRef.current.length > 0) {
      changeTrack(txid);
      setInfo(playlistRef.current[index]);
    }
  }, [txid]);

  useEffect(() => {
    const shouldSetInfoOnInitialPlaylistLoad = playlistRef.current.length === 0;
    playlistRef.current = playlist;

    if (shouldSetInfoOnInitialPlaylistLoad && playlistRef.current.length > 0) {
      setInfo(playlistRef.current[0]);
      if (!wallet?.connected && playlistRef.current[0]) {
        changeTrack(playlistRef.current[0].txid);
      }
    } else if (
      playlist.filter((playlistItem) => playlistItem.txid === info.txid)
        .length === 0
    ) {
      setIsPlaying(false);
      if (playlistRef.current[0]) {
        setInfo(playlistRef.current[0]);
      } else {
        setInfo(null);
        setDuration(0);
      }
      setTrackProgress(0);
      clearInterval(intervalRef.current);
    } else {
      let index = currentIndex();
      setInfo(playlistRef.current[index]);
      setDuration(0);
      setTrackProgress(0);
    }
  }, [playlist]);

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDuration(playerRef.current?.duration);

      if (playerRef.current.duration > 0 && !playerRef.current.paused) {
        setIsPlaying(true);
        setTrackProgress(Math.ceil(playerRef.current.currentTime));
      } else if (playerRef.current.currentTime > 0) {
        setIsPlaying(false);
        setTrackProgress(0);
        playNextTrack();
      }
    }, [300]);
  };

  const changeTrack = async (txid) => {
    playerRef.current.src = txid + "?ext=mp3";
    if (shouldPlay) {
      playerRef.current.play();
      startTimer();
    }
  };

  const playNextTrack = () => {
    let index = currentIndex() || 0;
    setTrackProgress(0);
    if (index >= 0) {
      const next = playlistRef.current[index + 1];
      if (next) {
        updateTxid(next.txid, next.releasePubkey, isPlaying);
      }
    }
  };

  const playPreviousTrack = () => {
    let index = currentIndex();
    setTrackProgress(0);

    if (index) {
      const prev = playlistRef.current[index - 1];
      if (prev) {
        updateTxid(prev.txid, prev.releasePubkey, isPlaying);
      }
    }
  };

  const seek = (newValue) => {
    if (playerRef.current) {
      setTrackProgress(newValue);
      playerRef.current.currentTime = newValue;
    }
  };

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
    width: "60px",
    height: "60px",
    cursor: "pointer",
  };

  return (
    <StyledAudioPlayer>
      <audio id="audio" style={{ width: "100%" }}>
        <source src={txid + "?ext=mp3"} type="audio/mp3" />
      </audio>

      {info && (
        <AlbumArt href={`/${info.releasePubkey}`}>
          <Image src={info.cover} height="60px" width="60px" />
        </AlbumArt>
      )}

      <Controls>
        <IconButton
          disabled={!currentIndex()}
          disableFocusRipple={true}
          disableRipple={true}
        >
          <SkipPreviousIcon
            onClick={() => playPreviousTrack()}
            sx={iconStyle}
          />
        </IconButton>
        <IconButton
          disabled={playlistRef.current.length === 0}
          disableFocusRipple={true}
          disableRipple={true}
        >
          {isPlaying ? (
            <PauseIcon onClick={() => setIsPlaying(false)} sx={iconStyle} />
          ) : (
            <PlayArrowIcon onClick={() => setIsPlaying(true)} sx={iconStyle} />
          )}
        </IconButton>
        <IconButton
          disabled={
            currentIndex() + 1 === playlistRef.current.length ||
            playlistRef.current.length <= 1
          }
          disableFocusRipple={true}
          disableRipple={true}
        >
          <SkipNextIcon onClick={() => playNextTrack()} sx={iconStyle} />
        </IconButton>
      </Controls>

      <ProgressContainer>
        {info && (
          <ArtistInfo align="left" variant="subtitle1">
            {info.artist}, <i>{info.title}</i>
          </ArtistInfo>
        )}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Slider
            value={txid ? trackProgress : 0}
            onChange={(e, newValue) => seek(newValue)}
            aria-labelledby="continuous-slider"
            min={0}
            max={duration}
          />

          <Typography
            sx={{ padding: "0 10px", display: { xs: "block", md: "none" } }}
            variant="subtitle1"
          >
            {NinaClient.formatDuration(trackProgress) || "00:00"}
          </Typography>
        </Box>
      </ProgressContainer>

      <Typography
        sx={{ padding: "0 30px", display: { xs: "none", md: "block" } }}
        variant="subtitle1"
      >
        {NinaClient.formatDuration(trackProgress) || "00:00"}
      </Typography>

      {info && (
        <LinkWrapper>
          <Link href={info.releasePubkey} style={{ marginRight: "30px" }} passHref>
            <a>
              <Typography variant="subtitle1" sx={{ padding: "0" }}>
                View Info
              </Typography>
            </a>
          </Link>

          <Button
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${`${info.artist} - "${info.title}" on Nina`}&url=nina.market/${
                  info.releasePubkey
                }`,
                null,
                "status=no,location=no,toolbar=no,menubar=no,height=500,width=500"
              )
            }
            disableFocusRipple={true}
            disableRipple={true}
          >
            <Image src={"/shareArrow.svg"} width="15px" height="15px" />
          </Button>
        </LinkWrapper>
      )}
      <QueueDrawer />
    </StyledAudioPlayer>
  );
};

const StyledAudioPlayer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: "0",
  width: "100%",
  height: "60px",
  maxWidth: "100vw",
  alignItems: "center",
  boxShadow: `0px -1px 5px 0px rgba(0,0,0,0.06)`,

  background: `${theme.palette.white}`,
  display: "flex",
  zIndex: "100",
}));

const AlbumArt = styled(Link)(() => ({
  width: "60px",
  height: "60px",
}));

const ArtistInfo = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  [theme.breakpoints.down("md")]: {
    whiteSpace: "wrap",
  },
}));

const Controls = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  "& svg": {
    height: "24px",
    width: "24px",
  },
  [theme.breakpoints.down("md")]: {
    padding: "10px",
    paddingRight: "0",
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: "250px",
  height: "48px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    width: "100px",
    padding: theme.spacing(0, 1),
  },
  "& .MuiSlider-root": {
    height: "7px",
    padding: "0",
    "& .MuiSlider-thumb": {
      color: theme.palette.blue,
      width: "14px",
      height: "11px",
    },
    "& .MuiSlider-track": {
      color: theme.palette.greyLight,
      height: "7px",
      border: "none",
    },
    "& .MuiSlider-rail": {
      color: theme.palette.greyLight,
      height: "7px",
    },
  },
}));

const LinkWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
  alignItems: "center",
  "& img": {
    height: "17px",
    width: "17px",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export default AudioPlayer;
