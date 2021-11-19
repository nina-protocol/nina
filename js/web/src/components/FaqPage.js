import React from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
// import SmoothImage from 'react-smooth-image';
// import { Link } from 'react-router-dom'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const FaqPage = () => {
  return (
    <ScrollablePageWrapper>
      <FaqPageContainer overflowX="visible">
        <Typography
          variant="h1"
          align="left"
          sx={{ padding: { md: '0 0 30px', xs: '30px 0px' } }}
        >
          FAQ
        </Typography>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            What is Nina?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            {
              "Nina is a new infrastructure to buy, sell and stream music online. Nina is designed to solve inequity and opportunism in the music industry by providing a new model that doesn't syphon revenue from artists."
            }
          </Typography>
          <Typography variant="h4" align="left">
            After a one time fee, releases on Nina are permanent. The patronage
            model created between artist and fan serves as a platform agnostic
            mechanism to provide exclusive experiences to supporters.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How does Nina work?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            When uploading releases to Nina, an artist chooses the edition size,
            price, and resale percentage of the release. The release will be
            publicly streamable and purchasble via USDC - the artist receives
            100% of initial sales.
          </Typography>
          <Typography variant="h4" align="left">
            Releases can sold on the secondary market at a price of the owners
            choosing. The artist receives their chosen percent of secondary
            sales and the Nina protocol receives 1.5%, paid by the seller.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How do I put my music on Nina?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            In order to ensure the smoothest possible experience, we are rolling
            out Nina in pieces. Currently, Nina Publishing Credits are required
            to access the upload page and can be requested{' '}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://docs.google.com/forms/d/e/1FAIpQLSdj13RKQcw9GXv3A5U4ebJhzJjjfxzxuCtB092X4mkHm5XX0w/viewform"
            >
              here
            </a>
            .
          </Typography>
          <Typography variant="h4" align="left">
            Soon, we will make the upload page publicly available and continue
            shipping new features.
          </Typography>
        </FaqEntry>
      </FaqPageContainer>
    </ScrollablePageWrapper>
  )
}

const PREFIX = 'faqPage'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const FaqPageContainer = styled('div')(({ theme }) => ({
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

const FaqEntry = styled(Box)(({ theme }) => ({
  paddingBottom: '30px',
  '& a': {
    color: theme.palette.blue,
  },
}))

export default FaqPage
