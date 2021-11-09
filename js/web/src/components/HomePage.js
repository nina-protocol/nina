import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import ninaCommon from 'nina-common'
import RecentlyPublished from './RecentlyPublished'
import RecentlyPurchased from './RecentlyPurchased'
// import SmoothImage from 'react-smooth-image';
import uploadPreview from '../assets/uploadPreview.png'
import {Link} from 'react-router-dom'
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
      <HomePageContainer>
        <Typography variant="h1" align="left" sx={{ padding: '0 165px 140px' }}>
          Nina is a new infrastructure to buy, sell and stream music online. We
          put control in the artist’s hands and link them directly with their
          fans. Learn more.
        </Typography>

        <Box sx={{padding: '0 80px 140px 80px'}}>
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
        <Typography variant="h1" align="left" sx={{ paddingBottom: '140px' }}>
          When you publish a release you get to decide the price and edition size.
          Releases are streamable and can be purchased by fans that want to
          support artists directly. Like physical records, fans can resell
          releases in a secondary marketplace, but unlike the physical world you
          automatically get a cut of all resales at whatever percentage you
          determine.
        </Typography>

        <MarketMovers sx={{paddingBottom: '140px'}}>
          <RecentlyPurchased releases={releasesRecent.purchased} />
        </MarketMovers>

        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          Radical Transparency
        </Typography>
        <Typography variant="h1" align="left" sx={{ paddingBottom: '140px' }}>
          On Nina artists keep 100% of their profits. When you sell your release
          for $5, you receive $5 each time it is sold. Artists pay a one-time
          publishing fee to set up a release, which covers storage of audio files,
          artwork, metadata and ensures the permanent availability of your
          release. This fee goes to Solana, the network that Nina is built on.
        </Typography>


        <Box sx={{padding: '0 165px 140px '}}>
          <Typography
            variant="body1"
            align="left"
            className={classes.sectionHeader}
          >
            Upload a track in minutes
          </Typography>
          <Link to="/upload" >
            <img style={{width: '100%'}} src={uploadPreview}/>
          </Link>
          
          <Typography variant="h3" align="left" sx={{paddingTop: '140px'}}>
            Instead of charging artists a fee to use Nina, we collect 1% of your edition (if you publish an edition of 1,000 Nina will receive 10 copies). We keep these in the Nina Vault, a treasury of all the content published on Nina. A 1% fee is also collected from fans at the point of sale and sellers on the secondary market. Whereas it can take months to be paid by current streaming services, with Nina you receive your revenue as soon as a sale occurs.
          </Typography>
        </Box>
        
      </HomePageContainer>
    </ScrollablePageWrapper>

  )
}

const PREFIX = 'homePage'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const HomePageContainer = styled(Box)(({ theme }) => ({
  width: '1110px',
  padding: '0 50px',
  margin: 'auto',
  overflowY: 'scroll',
  overflowX: 'visible',
  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 ',
    paddingBottom: `${theme.spacing(1)}`,
  },
}))

const MarketMovers = styled(Box)(() => ({
  minHeight: '400px',
  overflowX: 'visible',
}))

export default HomePage
