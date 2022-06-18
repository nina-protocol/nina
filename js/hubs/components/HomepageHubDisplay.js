import React, {useContext, useEffect, useMemo} from 'react'
import nina from '@nina-protocol/nina-sdk'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import Dots from './Dots'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Image from "next/image";


const { HubContext } = nina.contexts

const HomepageHubDisplay = () => {
  const { getHubs, hubState } = useContext(HubContext)
  const wallet = useWallet()

  useEffect(() => {
    getHubs()
  }, [])
  
  const hubs = useMemo(() => {
    return Object.values(hubState)
  }, [hubState])


  if (hubs.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '250px',
        }}
      >
        <Dots size="80px" />
      </Box>
    )
  }

  return (
      <HubsContainer >
          {/* <Box sx={{ paddingLeft: { md: '15px', xs: '0' } }} */}
            <Typography
              variant="h2"
              align="left"
              sx={{
                fontWeight: '700 !important', 
                paddingLeft: {md: '15px', xs: '0'},
                position: 'absolute',
                top: '0',
                background: 'white',
                zIndex: '1',
                width: '100%'
              }}
            >
             Explore Hubs
            </Typography>
          <HubGrid container >
            {hubs?.map(hub => {
              const imageUrl = hub?.json?.image;
              return(
                <HubTile item md={3} xs={6}>
            
                  {imageUrl &&
                    <HubLink href={`/${hub.handle}`}>
                      <a>
                        <Image
                          src={imageUrl}
                          height={100}
                          width={100}
                          layout="responsive"
                          priority={true}
                          unoptimized={true}
                          loading="eager"
                        />
                      </a>
                    </HubLink>
                  }
                  <HubName variant="h4">
                  {hub.json.displayName}
                  </HubName>
                </HubTile>
              )
            })}

          </HubGrid>
      </HubsContainer>

  )
}


const HubsContainer = styled('div')(({ theme }) => ({
  margin: 'auto',
  overflowX: 'visible',
  maxHeight: '40vh',
  overflowY: 'scroll',
  marginBottom: '40px',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: '90vw',
    margin: '100px 0',
  },
}))

const HubGrid = styled(Grid)(({theme}) => ({
  maxHeight: '40vh',
  overflowY: 'scroll',
  paddingTop: '20px',
  '&::-webkit-scrollbar': { 
    display: 'none'
  },
  [theme.breakpoints.down('md')]: {
    paddingBottom: '100px',
  },
}))

const HubTile = styled(Grid)(({theme}) => ({
  padding: '15px 15px 15px',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    padding: '10px'
  },
}))

const HubLink = styled(Link)(({theme}) => ({
  height: '100%',
  width: '100%'
}))

const HubName = styled(Typography)(({theme}) => ({
  paddingTop: '5px',
  fontWeight: '500'
}))


export default HomepageHubDisplay