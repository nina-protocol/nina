import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import ninaCommon from 'nina-common'
import RecentlyPublished from './RecentlyPublished'
import RecentlyPurchased from './RecentlyPurchased'
// import SmoothImage from 'react-smooth-image';
import { Link } from 'react-router-dom'
import ScrollablePageWrapper from './ScrollablePageWrapper'
const { ReleaseContext } = ninaCommon.contexts

const HomePage = () => {
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(ReleaseContext)
  const [releasesRecent, setReleasesRecent] = useState({})

  useEffect(() => {
    getReleasesRecent()
  }, [])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())
  }, [releasesRecentState])

  return (
    <ScrollablePageWrapper>
      <HomePageContainer overflowX="visible">
        <Typography
          variant="h1"
          align="left"
          sx={{ padding: { md: '0 165px 140px', xs: '30px 0px' } }}
        >
          Nina is a new way to publish, stream, and purchase music. We put
          control in the artist’s hands and link them directly with their fans.{' '}
          <Link to="/faq">Learn more</Link>.
        </Typography>

        <Box sx={{ padding: { md: '0 40px 140px 40px', xs: '30px 0px' } }}>
          <Box
            sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}
            className={classes.sectionHeader}
          >
            <Typography variant="body1" align="left">
              New Releases
            </Typography>

            <AllReleasesLink to="/allReleases">
              <Typography variant="body1">All Releases</Typography>
            </AllReleasesLink>
          </Box>
          <RecentlyPublished releases={releasesRecent.published} />
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
          sx={{ paddingBottom: { md: '140px', xs: '30px' } }}
        >
          When an artist publishes on Nina, their tracks are permanently hosted
          for both streaming and purchasing. Anyone can listen. By purchasing a
          release, fans support the artist directly - Nina does not take a cut.
          Soon, we will provide artists with the tools to engage these
          supporters.
        </Typography>

        <MarketMovers sx={{ paddingBottom: { md: '140px', xs: '30px' } }}>
          <RecentlyPurchased releases={releasesRecent.purchased} />
        </MarketMovers>

        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          Radical Transparency
        </Typography>
        <Typography
          variant="h1"
          align="left"
          sx={{ paddingBottom: { md: '140px', xs: '30px' } }}
        >
          On Nina artists keep <span>100% </span> of their sales and can access{' '}
          <span>100% </span> of their data. They will never be deplatformed or
          separated from their supporters. We make tools to bring equity back to
          music online.
        </Typography>
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
    '& .MuiTypography-root': {
      textTransform: 'uppercase !important',
      fontWeight: '700 !important',
    },
  },
  '& a, span': {
    color: theme.palette.blue,
  },
}))

const MarketMovers = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  overflowX: 'visible',
  width: '60%',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const AllReleasesLink = styled(Link)(({ theme }) => ({
  marginLeft: '30px',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

export default HomePage
