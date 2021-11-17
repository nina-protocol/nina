import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import ninaCommon from 'nina-common'
import RecentlyPublished from './RecentlyPublished'
import RecentlyPurchased from './RecentlyPurchased'
// import SmoothImage from 'react-smooth-image';
// import { Link } from 'react-router-dom'
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
          Nina is a new infrastructure to buy, sell and stream music online. We
          put control in the artist’s hands and link them directly with their
          fans. Learn more.
        </Typography>

        <Box sx={{ padding: { md: '0 80px 140px 80px', xs: '30px 0px' } }}>
          <Typography
            variant="body1"
            align="left"
            className={classes.sectionHeader}
          >
            New Releases
          </Typography>
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
          When you publish a release you get to decide the price and edition
          size. Releases are streamable and can be purchased by fans that want
          to support artists directly. Like physical records, fans can resell
          releases in a secondary marketplace, but unlike the physical world you
          automatically get a cut of all resales at whatever percentage you
          determine.
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
          On Nina artists keep 100% of their profits. When you sell your release
          for $5, you receive $5 each time it is sold. Artists pay a one-time
          publishing fee to set up a release, which covers storage of audio
          files, artwork, metadata and ensures the permanent availability of
          your release. This fee goes to Solana, the network that Nina is built
          on.
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
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 ',
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: 'uppercase',
  },
}))

const MarketMovers = styled(Box)(() => ({
  minHeight: '400px',
  overflowX: 'visible',
  width: '60%',
  margin: 'auto',
}))

export default HomePage
