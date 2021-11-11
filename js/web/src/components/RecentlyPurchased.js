import React from 'react'
import { styled } from '@mui/material/styles'
import 'react-multi-carousel/lib/styles.css'
import { Typography, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import SmoothImage from 'react-smooth-image'
import CircularProgress from '@mui/material/CircularProgress'

const RecentlyPurchased = (props) => {
  const { releases } = props
  if (releases === undefined || releases.length === 0) {
    return (
      <RecentlyPurchasedContainer
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress color="black" />
      </RecentlyPurchasedContainer>
    )
  }

  const featuredRelease = releases[0]

  const releaseDate = new Date(
    featuredRelease.tokenData.releaseDatetime.toNumber() * 1000
  )
  const dateNow = new Date()
  const differenceTime = dateNow.getTime() - releaseDate.getTime()
  const dayDifference = Math.round(differenceTime / (1000 * 3600 * 24))

  const sales =
    featuredRelease.tokenData.totalSupply.toNumber() -
    featuredRelease.tokenData.remainingSupply.toNumber() +
    featuredRelease.tokenData.exchangeSaleCounter.toNumber()
  const imageUrl = featuredRelease.metadata.image

  const artistInfo = (
    <Typography variant="body2" align="left">
      {featuredRelease.metadata.properties.artist},{' '}
      {featuredRelease.metadata.properties.title}
    </Typography>
  )
  const availability = (
    <Typography variant="body2" align="left">
      {featuredRelease.tokenData.remainingSupply.toNumber()} /{' '}
      {featuredRelease.tokenData.totalSupply.toNumber()}
    </Typography>
  )

  return (
    <>
      <RecentlyPurchasedContainer>
        <Typography align="left" className={classes.sectionHeader}>
          Market Movers
        </Typography>
        <Wrapper>
          <Link
            to={'/releases/' + featuredRelease.releasePubkey}
            style={{ width: '400px' }}
          >
            <SmoothImage src={imageUrl} imageStyles={{ minWidth: '400px' }} />
          </Link>
          <Copy sx={{ paddingLeft: 2 }}>
            <Typography align="left" variant="h3" color="blue">
              {sales} Releases were sold in the last {dayDifference} days
            </Typography>
            {availability}
            {artistInfo}
          </Copy>
        </Wrapper>
      </RecentlyPurchasedContainer>
    </>
  )
}

const PREFIX = 'recentlyPurchased'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const RecentlyPurchasedContainer = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  marginLeft: '35%',
  flexShrink: '0',
  alignItems: 'center',
  '& a': {
    minWidth: '400px',
  },

  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 ',
    paddingBottom: `${theme.spacing(1)}`,
  },
}))

const Wrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}))

const Copy = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  '& *': {
    paddingBottom: '5px',
  },
}))

export default RecentlyPurchased
