import React from 'react'
import { styled } from '@mui/material/styles'
import {Typography, Box} from '@mui/material'

const HomePage = () => {

  return (
    <HomePageContainer>
      <Typography variant="h1" align="left" sx={{padding: '0 165px 140px'}}>
        Nina is a new infrastructure to buy, sell and stream music online. We put control in the artist’s hands and link them directly with their fans. Learn more.
      </Typography>

      <Box>
        <Typography>
          new releases
        </Typography>
      </Box>

      <Typography variant="body1" align="left" sx={{paddingBottom: '15px'}}>
        How it works
      </Typography>
      <Typography variant="h1" align="left" sx={{paddingBottom: '140px'}}>
        When you publish a release you get to decide the price and edition size. Releases are streamable and can be purchased by fans that want to support artists directly. Like physical records, fans can resell releases in a secondary marketplace, but unlike the physical world you automatically get a cut of all resales at whatever percentage you determine.    
      </Typography>


      <Box>
        <Typography>
          market movers
        </Typography>
      </Box>

      <Typography variant="body1" align="left" sx={{paddingBottom: '15px'}}>
        Radical Transparency
      </Typography>
      <Typography variant="h1" align="left" sx={{paddingBottom: '140px'}}>
        On Nina artists keep 100% of their profits. When you sell your release for $5, you receive $5 each time it is sold. Artists pay a one-time publishing fee to set up a release, which covers storage of audio files, artwork, metadata and ensures the permanent availability of your release. This fee goes to Solana, the network that Nina is built on. 
      </Typography>


    </HomePageContainer>
  )
}

const HomePageContainer = styled(Box)(() => ({
  border: '2px solid red',
  width: '1010px',
  paddingTop: '240px',
  overflowY: 'scroll'
}))

export default HomePage;