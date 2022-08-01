import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import Button from '@mui/material/Button'
import Audio from '@nina-protocol/nina-sdk/esm/Audio'
import Hub from '@nina-protocol/nina-sdk/esm/Hub'
import Release from '@nina-protocol/nina-sdk/esm/Release'
import { useSnackbar } from 'notistack'
import RecentlyPublished from './RecentlyPublished'
import Link from 'next/link'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import HubSlider from './HubSlider'

const HomePage = () => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getHubs, hubState, filterFeaturedHubs } = useContext(Hub.Context)
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(Release.Context)
  const [releasesRecent, setReleasesRecent] = useState({})
  const [hubs, setHubs] = useState(undefined)

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    getReleasesRecent()
    getHubs(true)
  }, [])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())
  }, [releasesRecentState])

  useEffect(() => {
    if ((!hubs || hubs.length === 0) & Object.keys(hubState).length > 0) {
      setHubs(filterFeaturedHubs())
    }
  }, [hubState])

  return (
    <ScrollablePageWrapper>
      <HomePageContainer overflowX="visible">
        <BlueTypography
          variant="h1"
          align="left"
          sx={{ padding: { md: '0 165px 140px', xs: '30px 0px' } }}
        >
          Nina is a new way to <Link href="/upload">publish</Link>,{' '}
          <Link href="https://radio.ninaprotocol.com">listen to</Link>, and{' '}
          <Link href="/releases">purchase</Link> music. We build tools for
          artists + fans to create their <a
            href="https://hubs.ninaprotocol.com/"
            target="_blank"
            rel="noreferrer"
            passHref
          >context</a>.{' '}
        </BlueTypography>

        <Box sx={{ padding: { md: '0 40px 140px 40px', xs: '30px 0px' } }}>
          <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              <a
                href="https://hubs.ninaprotocol.com/"
                target="_blank"
                rel="noreferrer"
                passHref
              >Hubs</a>
            </Typography>
          </Box>
          <HubSlider hubs={hubs} />
        </Box>

        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          How it works
        </Typography>
        <Typography
          variant="h1"
          align="left"
          sx={{paddingBottom: {md: '30px', xs: '30px'}}}
        >
          Music on Nina can be publicly streamed by anyone, while also being
          released in the form of a digital edition as scarce or ubiquitous as
          the artist desires. You can use Nina to simply host your music, to
          sell digital editions, or to build out a patronage mechanism by
          providing unique content + experiences to paying supporters.
        </Typography>
        <BlueTypography
          variant="h1"
          align="left"
          sx={{paddingBottom: {md: '140px', xs: '30px'}}}
        >
          More questions? Read our{' '}
          <a
            href="https://nina-protocol.notion.site/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612"
            target="_blank"
            rel="noreferrer"
            passHref
          >
            FAQ
          </a>
          .
        </BlueTypography>


        <Box sx={{ padding: { md: '0 40px 140px 40px', xs: '30px 0px' } }}>
          <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              <Link href="/releases/highlights">Highlights</Link>
              <Button
                sx={{ padding: '6px 8px' }}
                onClick={() =>
                  resetQueueWithPlaylist(
                    releasesRecent.highlights.map(
                      (release) => release.releasePubkey
                    )
                  ).then(() => {
                    enqueueSnackbar('Now Playing: Nina Highlights', {
                      variant: 'info',
                    })
                  })
                }
              >
                <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
              </Button>
            </Typography>
          </Box>
          <RecentlyPublished releases={releasesRecent.highlights?.slice(0, 15) || []} />
        </Box>

        <Box sx={{ padding: { md: '0 40px 140px 40px', xs: '30px 0px' } }}>
          <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              <Link href="/releases/new">New Releases</Link>
              <Button
                sx={{ padding: '6px 8px' }}
                onClick={() =>
                  resetQueueWithPlaylist(
                    releasesRecent.published.map(
                      (release) => release.releasePubkey
                    )
                  ).then(() => {
                    enqueueSnackbar('Now Playing: New Releases', {
                      variant: 'info',
                    })
                  })
                }
              >
                <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
              </Button>
            </Typography>
          </Box>
          <RecentlyPublished releases={releasesRecent.published || []} />
        </Box>
        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          Our product is the Nina protocol, not your music.
        </Typography>
        <Typography
          variant="h1"
          align="left"
          sx={{ paddingBottom: { md: '140px', xs: '30px' } }}
        >
          Artists receive 100% of their sales. The only fee is a one-time
          payment (on average ~$4/release) that covers the storage and
          transaction costs to the Solana and Arweave networks that Nina is
          built on. Nina does not take a cut.
        </Typography>
        <BlueTypography
          variant="h1"
          align="center"
          sx={{ paddingBottom: { md: '140px', xs: '30px' } }}
        >
          <Link href="/releases">Start exploring.</Link>
        </BlueTypography>
      </HomePageContainer>
    </ScrollablePageWrapper>
  )
}

const PREFIX = 'homePage'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const HomePageContainer = styled('div')(({ theme }) => ({
  width: '1010px',
  margin: 'auto',
  overflowX: 'visible',
  [theme.breakpoints.down('md')]: {
    width: '80vw',
    marginBottom: '100px',
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 !important',
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: 'uppercase !important',
    position: 'relative',
    '& .MuiTypography-root': {
      textTransform: 'uppercase !important',
      fontWeight: '700 !important',
    },
    '& .MuiButton-root': {
      position: 'absolute',
      top: '-10px',
    },
  },
}))

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': { color: theme.palette.blue },
}))

export default HomePage
