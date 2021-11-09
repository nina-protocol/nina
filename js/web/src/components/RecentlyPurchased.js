import React from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'
import 'react-multi-carousel/lib/styles.css'
import { Typography } from '@material-ui/core'
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
  const imageUrl = featuredRelease.metadata.image
  const artistInfo = (
    <Typography variant="body2">
      {featuredRelease.metadata.properties.artist},{' '}
      {featuredRelease.metadata.properties.title}
    </Typography>
  )
  const availability = (
    <Typography variant="body2">
      {featuredRelease.tokenData.remainingSupply.toNumber()} /{' '}
      {featuredRelease.tokenData.totalSupply.toNumber()}
    </Typography>
  )

  return (
    <RecentlyPurchasedContainer>
      <Link
        to={'/release/' + featuredRelease.releasePubkey}
        style={{ width: '400px' }}
      >
        <SmoothImage src={imageUrl} imageStyles={{ minWidth: '400px' }} />
      </Link>
      <Box>
        {artistInfo}
        {availability}
      </Box>
    </RecentlyPurchasedContainer>
  )
}

const RecentlyPurchasedContainer = styled(Box)(() => ({
  // width: '100%',
  minHeight: '400px',
  border: '2px solid blue',
  marginLeft: '50%',
  display: 'flex',
  alignItems: 'center',
  '& img': {
    width: '400px',
  },
}))

export default RecentlyPurchased
