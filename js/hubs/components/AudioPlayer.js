import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import Audio from "@nina-protocol/nina-sdk/esm/Audio";
import Hub from "@nina-protocol/nina-sdk/esm/Hub";
import Release from "@nina-protocol/nina-sdk/esm/Release";
import { formatDuration } from "@nina-protocol/nina-sdk/esm/utils"
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Link from 'next/link'

const AudioPlayer = ({ hubPubkey }) => {
  const { releaseState } = useContext(Release.Context);
  const { hubContentState, filterHubContentForHub, hubState } = useContext(Hub.Context);
  const audio = useContext(Audio.Context);
  const [tracks, setTracks] = useState({});
  const {
    track,
    playNext,
    playPrev,
    updateTrack,
    playlist,
    createPlaylistFromTracksHubs,
    isPlaying,
    initialized,
    setInitialized,
    audioPlayerRef
  } = audio;

  const audioInitialized = useMemo(() => initialized, [initialized])
  useEffect(() => {
    const trackObject = {};
    const [hubReleases] = filterHubContentForHub(hubPubkey);
    hubReleases.forEach((hubRelease) => {
      let contentItem;
      if (
        hubRelease.contentType === "NinaReleaseV1" &&
        releaseState.metadata[hubRelease.release] &&
        hubRelease.visible
      ) {
        contentItem = releaseState.metadata[hubRelease.release];
        contentItem.contentType = hubRelease.contentType;
        contentItem.publicKey = hubRelease.release;
        contentItem.hubReleaseId = hubRelease.hubReleaseId
        contentItem.hubHandle = hubState[hubRelease.hub].handle
        contentItem.datetime = hubRelease.datetime;
        trackObject[hubRelease.release] = contentItem;
      }
    });
    setTracks(trackObject);
  }, [hubContentState, hubState, hubPubkey]);

  const activeTrack = useRef();
  const intervalRef = useRef();
  const activeIndexRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0.0);

  useEffect(() => {
    audioPlayerRef.current = document.querySelector("#audio");

    const actionHandlers = [
      ["play", () => play()],
      ["pause", () => play()],
      ["previoustrack", () => previous()],
      ["nexttrack", () => next()],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(
          `The media session action "${action}" is not supported yet.`
        );
      }
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (Object.values(tracks).length > 0) {
      const trackValues = Object.values(tracks)
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      createPlaylistFromTracksHubs(trackValues);
    }
  }, [tracks, hubContentState]);

  useEffect(() => {
    if (isPlaying && audioInitialized) {
      play();
    } else {
      pause();
    }
  }, [isPlaying]);
  const hasNext = useMemo(
    () => activeIndexRef.current + 1 < playlist.length,
    [activeIndexRef.current, playlist]
  );
  const hasPrevious = useMemo(
    () => activeIndexRef.current > 0,
    [activeIndexRef.current]
  );
  useEffect(() => {
    if (track && audioInitialized) {
      if (audioPlayerRef.current.src !== track.txid) {
        activeIndexRef.current = playlist.indexOf(track);
        activeTrack.current = track;
        audioPlayerRef.current.src = track.txid;
      }
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeTrack.current.title,
          artist: activeTrack.current.artist,
          artwork: [
            {
              src: activeTrack.current.cover,
              sizes: "512x512",
              type: "image/jpeg",
            },
          ],
        });
      }
    }
    if (audioInitialized && isPlaying) {
      play();
    }
  }, [track, audioInitialized]);

  useEffect(() => {
    if (
      playlist.length > 0 &&
      !activeIndexRef.current &&
      track?.releasePubkey != playlist[0].releasePubkey
    ) {
      updateTrack(playlist[0].releasePubkey, false);
    }
  }, [playlist, activeIndexRef.current]);

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (
        audioPlayerRef.current.currentTime > 0 &&
        audioPlayerRef.current.currentTime < audioPlayerRef.current.duration &&
        !audioPlayerRef.current.paused
      ) {
        setTrackProgress(Math.ceil(audioPlayerRef.current.currentTime));
      } else if (audioPlayerRef.current.currentTime >= audioPlayerRef.current.duration) {
        next();
      }
    }, [300]);
  };

  const previous = () => {
    if (hasPrevious) {
      setTrackProgress(0);
      activeIndexRef.current = activeIndexRef.current - 1;
      playPrev(true);
    }
  };

  const play = () => {
    if (audioPlayerRef.current.paused) {
      audioPlayerRef.current.play();
      setPlaying(true);
      startTimer();
    } else {
      // pause()
    }
  };

  const playButtonHandler = () => {
    if (!initialized) {
      setInitialized(true)
    }
    if (audioPlayerRef.current.paused) {
      if (track) {
        updateTrack(track.releasePubkey, true);
      }
    } else {
      pause();
    }
  };

  const pause = () => {
    audioPlayerRef.current.pause();
    setPlaying(false);
    clearInterval(intervalRef.current);
    if (track) {
      updateTrack(track.releasePubkey, false);
    }
  };

  const next = () => {
    if (hasNext) {
      setTrackProgress(0);
      activeIndexRef.current = activeIndexRef.current + 1;
      playNext(true);
    } else {
      // This means we've reached the end of the playlist
      setPlaying(false);
    }
  };

  const seek = (newValue) => {
    if (audioPlayerRef.current) {
      setTrackProgress(newValue)
      audioPlayerRef.current.currentTime = newValue
    }
  }

  return (
    <Player>
      {track && (
        <>
          <Controls>
            <Button onClick={() => previous()} disabled={!hasPrevious}>
              Previous
            </Button>
            <span>{` | `}</span>
            <Button onClickCapture={() => playButtonHandler()} disabled={!track}>
              {playing ? "Pause" : "Play"}
            </Button>
            <span>{` | `}</span>
            <Button onClick={() => next()} disabled={!hasNext}>
              Next
            </Button>
            {track && (
              <Box>
                <Typography>Now Playing:{' '}
                <Link href={`/${track.hubHandle}/releases/${track.hubReleaseId}`}>
                    {`${track.artist} - ${track.title}`}
                </Link>
                </Typography>
                <Typography>{`${formatDuration(
                  trackProgress
                )} / ${formatDuration(track.duration)}`}</Typography>
              </Box>
            )}
          </Controls>


          <ProgressContainer>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Slider
                value={track ? trackProgress : 0}
                onChange={(e, newValue) => seek(newValue)}
                aria-labelledby="continuous-slider"
                min={0}
                max={track?.duration}
              />

   
            </Box>
          </ProgressContainer>
        </>
      )}

      <audio id="audio" style={{ width: "100%" }}>
        <source src={track?.txid + '?ext=mp3'} type="audio/mp3" />
      </audio>
      <Typography sx={{pb: "5px", whiteSpace: 'nowrap'}}>
        <a href={`https://hubs.ninaprotocol.com/all`} target="_blank" rel="noreferrer" >
          Hubs
        </a>
        :{' '}
        <a href={`https://ninaprotocol.com/`} target="_blank" rel="noreferrer" >
          Powered by Nina.
        </a>
      </Typography>
    </Player>
  );
};

const Player = styled("div")(({theme}) => ({
  paddingTop: '0',
  width: '100%',
  background: theme.palette.background.default,
  border: '1p solid red',
  [theme.breakpoints.down('md')]: {
    position: 'fixed',
    bottom: '0',
    width: '100vw',
    background: theme.palette.background.default,
    paddingTop: '8px',
    paddingLeft: '15px'
  },
  "& .MuiButton-root": {
    fontSize: theme.typography.body1.fontSize,
    backgroundColor: `${theme.palette.transparent} !important`,
    padding: 0,
    color: theme.palette.text.primary,
    ":disabled": {
      color: theme.palette.text.primary + "b0",
    },
  },
  "& a": {
    color: theme.palette.text.primary,
    textDecoration: "none",
  },
}));


const Controls = styled("div")(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.down('md')]: {
    paddingBottom: '0'
  },
  "& .MuiButton-root": {
    fontSize: theme.typography.body1.fontSize,
    padding: 0,
    color: theme.palette.text.primary,
    height: '14px',
    ":hover": {
      opacity: "50%",
    },
    ":disabled": {
      color: theme.palette.text.primary + "a0",
    },
  },
}));

const ProgressContainer = styled(Box)(({theme}) => ({
  height: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  paddingLeft: '7px',
  [theme.breakpoints.down('md')]: {
    width: 'calc(100% - 15px)',
    padding: theme.spacing(1, 1),
  },
  '& .MuiSlider-root': {
    height: '2px',
    padding: '0',
    '& .MuiSlider-thumb': {
      color: theme.palette.primary.main,
      backgroundColor: `${theme.palette.primary.main} !important`,
      width: '14px',
      height: '11px',
    },
    '& .MuiSlider-track': {
      backgroundColor: theme.palette.primary.main,
      height: '2px',
      border: 'none',
      marginLeft: '-7px',
      paddingRight: '5px',
    },
    '& .MuiSlider-rail': {
      backgroundColor: theme.palette.primary.main,
      height: '2px',
    },
  },
}))

export default AudioPlayer;
