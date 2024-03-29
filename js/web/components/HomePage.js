import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import Button from '@mui/material/Button'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { useSnackbar } from 'notistack'
import RecentlyPublished from './RecentlyPublished'
import Link from 'next/link'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import HubSlider from './HubSlider'

const HomePage = ({ loading }) => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(Release.Context)
  const { getSolPrice } = useContext(Nina.Context)
  const [releasesRecent, setReleasesRecent] = useState({})
  const [hubs, setHubs] = useState(undefined)

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    getSolPrice()
    if (!loading) {
      getReleasesRecent({ limit: 12 }, false)
    }
  }, [loading])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())
  }, [releasesRecentState])

  return (
    <ScrollablePageWrapper paddingTop={'180px'}>
      <HomePageContainer overflowX="visible">
        <BlueTypography
          variant="h1"
          align="left"
          sx={{ padding: { md: '0 165px 100px', xs: '30px 0px' } }}
        >
          Welcome to Nina, <div>an independent music ecosystem.</div>
        </BlueTypography>

        <Box sx={{ padding: { md: '0 40px 80px 40px', xs: '30px 0px' } }}>
          <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              <Link href="/releases/highlights">
                <a>Highlights</a>
              </Link>
              {releasesRecent.highlights?.length > 0 && (
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
              )}
            </Typography>
          </Box>
          <RecentlyPublished
            releases={releasesRecent.highlights?.slice(0, 15) || []}
          />
        </Box>

        <Typography
          variant="h1"
          align="left"
          sx={{
            paddingTop: { md: '40px', sx: '30px' },
            paddingBottom: { md: '40px', xs: '30px' },
          }}
        >
          On Nina, music is stored publicly and permanently. Artists receive
          100% of their sales. Our tools help you create and support context
          around music.
        </Typography>

        <Box sx={{ padding: { md: '80px 40px 140px 40px', xs: '30px 0px' } }}>
          <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              <Link href="/hubs">
                <a>Hubs</a>
              </Link>
            </Typography>
          </Box>
          <HubSlider hubs={hubs} loading={loading} />
        </Box>
        <Box align="center" sx={{ paddingBottom: { md: '140px', xs: '30px' } }}>
          <BlueTypography variant="h1" align="center">
            <a
              href="https://help.ninaprotocol.com/hc/en-us/articles/14331496823319-What-is-Nina-"
              target="_blank"
              rel="noreferrer"
            >
              Learn More
            </a>{' '}
            or{' '}
            <Link href="/start">
              <a>Sign up</a>
            </Link>
          </BlueTypography>
        </Box>
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
  '& div': { color: theme.palette.blue },
  '& a': { color: theme.palette.blue },
}))

export default HomePage
