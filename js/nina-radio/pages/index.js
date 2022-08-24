import React, { useEffect, useState, useRef, useContext } from 'react'
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import { formatDuration } from "@nina-protocol/nina-internal-sdk/esm/utils";
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { styled } from "@mui/material/styles"
import Dots from '../components/Dots'

export default function Home() {
  const playerRef = useRef()
  const intervalRef = useRef()
  const [isRecent, setIsRecent] = useState(false)
  const [tracks, setTracks] = useState({})
  const [playlist, setPlaylist] = useState([])
  const [activeIndex, setActiveIndex] = useState()
  const activeTrack = useRef()
  const [playing, setPlaying] = useState(false)
  const [trackProgress, setTrackProgress] = useState(0.0)
  const hasPrevious = useRef(false)
  const hasNext = useRef(false)
  const activeIndexRef = useRef()
  const [related, setRelated] = useState([])
  const { getRelatedForRelease, filterRelatedForRelease, releaseState } = useContext(Release.Context)

  useEffect(() => {
    playerRef.current = document.querySelector("#audio")
    setupMediaSession()
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])
  
  useEffect(() => {
    if (Object.keys(tracks).length) {
      const releases = Object.keys(tracks)
      shuffle(releases)
      setPlaylist(releases)
      activeIndexRef.current = 0
      setActiveIndex(0)
      if (releases.length > 0) {
        activeTrack.current = tracks[releases[0]]
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: activeTrack.current.properties.title,
            artist: activeTrack.current.properties.artist,
            artwork: [
              { src: activeTrack.current.image, sizes: '512x512', type: 'image/jpeg' },
            ]
          });
        }
      }
    }
  }, [tracks])

  useEffect(() => {
    const track = tracks[playlist[activeIndexRef.current]]
    if (track) {
      if (track && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.properties.title,
          artist: track.properties.artist,
          artwork: [
            { src: track.image, sizes: '512x512', type: 'image/jpeg' },
          ]
        });
      }
      getRelatedReleases()
      activeTrack.current = track
      hasNext.current = (activeIndexRef.current + 1) <= playlist.length
      hasPrevious.current = activeIndexRef.current > 0
      playerRef.current.src = track.animation_url
      play()
    }
  }, [activeIndex])

  useEffect(() => {
    const release = playlist[activeIndexRef.current]
    const related = filterRelatedForRelease(release)
    setRelated(related.map(release => release.metadata))
  }, [releaseState])

  useEffect(() => {
    getTracks()
  }, [isRecent])

  const setupMediaSession = () => {
    const actionHandlers = [
      ['play',          () => play()],
      ['pause',         () => play()],
      ['previoustrack', () => previous()],
      ['nexttrack',     () => next()],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`The media session action "${action}" is not supported yet.`);
      }
    }
  }

  const getRelatedReleases = async () => {
    setRelated([])
    const release = playlist[activeIndexRef.current]
    await getRelatedForRelease(release)
  }

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {

      if (playerRef.current.currentTime > 0 && playerRef.current.currentTime < playerRef.current.duration && !playerRef.current.paused) {
        setTrackProgress(Math.ceil(playerRef.current.currentTime));
      } else if (playerRef.current.currentTime >= playerRef.current.duration) {
        next();
      }
    }, [300]);
  };

  const getTracks = async () => {
    setTracks({})
    activeIndexRef.current = undefined
    let url = "https://api.nina.market/metadata"

    if (isRecent) {
      url += "?filter=recent"
    }

    const response = await axios.get(url, {
      method: "GET",
    });
    
    if (response?.data) {
      setTracks(response.data)
    }
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${`${activeTrack.current.properties.artist} - "${activeTrack.current.properties.title}" on Nina%0A`}&url=ninaprotocol.com/${playlist[activeIndex]}`,
      null,
      'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
    )
  }

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const previous = () => {
    if (hasPrevious.current) {
      setTrackProgress(0)
      setActiveIndex(activeIndexRef.current - 1)
      activeIndexRef.current = activeIndexRef.current - 1
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
      playerRef.current.pause()
      setPlaying(false)
      clearInterval(intervalRef.current)
    }
  }

  const next = () => {
    if (hasNext.current) {
      setTrackProgress(0)
      setActiveIndex(activeIndexRef.current + 1)
      activeIndexRef.current = activeIndexRef.current + 1
    }
  }

  const DynamicFooter = ({playlist, isRecent}) => (
    <Box>
      <Typography>{`Nina Radio is a randomized selection of releases published through the Nina Protocol.`}</Typography><span>{"  "}</span>
      <Typography >{`You are currently listening to a selection of ${isRecent ? ` ${playlist.length} releases published in the last 7 days` : ` all ${playlist.length} releases`}.`}</Typography>
      <ClickableTypography onClick={() => setIsRecent(!isRecent)}>{`Switch to ${isRecent ? "All" : "Recent"} releases instead?`}</ClickableTypography>
      <a
        href="https://ninaprotocol.com"
        target="_blank"
        rel="noreferrer"
      >
        <Typography>Powered by Nina.</Typography>
      </a>
    </Box>
  )

  return (
    <RadioRoot>
      <Head>
        <title>Nina Radio{activeTrack.current ? ` - ${activeTrack.current.properties.artist} - "${activeTrack.current.properties.title}"` : ""}</title>
        <meta name="description" content="Radio player built on the Nina protocol" />
      </Head>
        <Grid container md={12} xs={12} sx={{height:{md: '100%', xs: 'unset'}}}>
          <Grid md={4} xs={12} sx={{minHeight: {md: 'unset', xs: '34vh'}}}>
            <Logo>
              <Typography variant="h4">NINA RADIO</Typography>
            </Logo>

            {activeTrack.current &&
              <>
                <Controls>
                  <Button onClick={() => previous()} disabled={!hasPrevious.current}>Previous</Button>
                  <span>{` | `}</span>
                  <Button onClick={() => play()}>{playing ? 'Pause' : 'Play'}</Button>
                  <span>{` | `}</span>
                  <Button onClick={() => next()} disabled={!hasNext.current}>Next</Button>
                </Controls>
                <Typography display="inline">
                  Now Playing: {activeTrack.current.properties.artist},
                </Typography>{" "}
                <Typography
                  display="inline"
                  sx={{ fontStyle: "italic" }}
                >
                  {activeTrack.current.properties.title}
                </Typography>
                <Typography>{`${formatDuration(trackProgress)} / ${formatDuration(activeTrack.current.properties.files[0].duration)}`}</Typography>
                <Links>
                  <a
                    href={activeTrack.current.external_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Typography>View release</Typography>
                  </a>
                  {related.length > 1 &&
                    <a
                      href={activeTrack.current.external_url + "/related"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Typography>View {related.length - 1} related {related.length - 1 === 1 ? "release" : "releases"}</Typography>
                    </a>
                  }
                  <ClickableTypography onClick={() => shareOnTwitter()}>Share</ClickableTypography>
                </Links>
              </>
            }
          </Grid>
          <Grid item md={8} xs={12} sx={{minHeight: {md: 'unset', xs: '50vh'}}}>
            {activeTrack?.current &&
              <Artwork>
                <Image
                  src={activeTrack.current.image}
                  alt={activeTrack.current.name}
                  width="100%"
                  height="100%"
                  layout='fill'
                  objectFit='contain'
                  priority={true}
                />
              </Artwork>
            }
            {!activeTrack?.current &&
              <Box sx={{height: '100%', display: 'flex', justifyContent: 'center'}}>
                <Dots size="80px" />
              </Box>
            }
          </Grid>
        </Grid>
      <Footer>
        <DynamicFooter playlist={playlist} isRecent={isRecent} />
      </Footer>
      <audio id="audio" style={{ width: "100%" }}>
        <source src={activeTrack.current?.animation_url} type="audio/mp3" />
      </audio>
    </RadioRoot>
  )
}

const RadioRoot = styled(Box)(({theme}) => ({
  height: '100%',
  width: '100%',
  "& .MuiTypography-h4": {
    fontWeight: "bold",
  },
}));


const Logo = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(1),
  top: theme.spacing(1),
  "& .MuiTypography-h4": {
    fontWeight: "bold",
  },
}));

const Controls = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  width: "100%",
  "& .MuiButton-root": {
    fontSize: theme.typography.body1.fontSize,
    padding: 0,
    color: theme.palette.black,
    ":hover": {
      color: theme.palette.blue,
    },
    ":disabled": {
      color: theme.palette.greyLight,
    }
  }
}))

const Links = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(2),
  width: "100%",
  "& .MuiButton-root": {
    fontSize: theme.typography.body1.fontSize,
    padding: 0,
    color: theme.palette.black,
    ":hover": {
      color: theme.palette.blue,
    },
  },
}))


const Artwork = styled("div")(({theme}) => ({
  width: "100%",
  height: "100%",
  position: "relative",
  "& img": {
    objectPosition: "right",
  [theme.breakpoints.down("md")]: {
    objectPosition: "left",
    },
  }
}))

const Footer = styled(Box)(({theme}) => ({
  position: "absolute",
  bottom: 0,
  display: "flex",
  justifyContent: "space-between",
  [theme.breakpoints.down("md")]: {
    paddingTop: theme.spacing(1),
    paddingBottom: '120px',
    position: 'unset'
  },
  "& a": {
    paddingRight: "15px",
  },
}))

const ClickableTypography = styled(Typography)(({theme}) => ({
  ":hover": {
    color: theme.palette.blue,
  },
  cursor: "pointer"
}))
