import React, {useContext, useEffect, useMemo} from 'react'
import nina from '@nina-protocol/nina-sdk'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import HubSlider from './HubSlider'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { HubContext } = nina.contexts

const Hubs = () => {
  const { getHubs, hubState } = useContext(HubContext)
  const hubs = useMemo(() => Object.values(hubState).sort((a,b) => new Date(b.datetime) - new Date(a.datetime)), [hubState])
  const wallet = useWallet()

  useEffect(() => {
    getHubs()
  }, [])

  return (
    <ScrollablePageWrapper>
      <HubsContainer overflowX="visible">
        <Box sx={{ padding: { md: '40px 40px 140px 40px', xs: '30px 0px' } }}>
          {/* <Box sx={{ paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              Hubs
            </Typography>
          </Box>
          <HubSlider hubs={hubs} /> */}
          <Typography
            variant="h1"
            align="left"
            sx={{ padding: { md: '0 165px 40px', xs: '30px 0px' } }}
          >
            Hubs are a new way to publish, share, and discuss music.
          </Typography>
          <Typography
            variant="h1"
            align="left"
            sx={{ padding: { md: '0 165px 40px', xs: '30px 0px' } }}
          >
            Hubs give you a space to create your context.
          </Typography>
          <BlueTypography
            variant="h1"
            align="left"
            sx={{ padding: { md: '0 165px 140px', xs: '30px 0px' } }}
          >
            <Link href="/upload">Sign up</Link> to get started or connect your wallet.  Learn more.
          </BlueTypography>
        </Box>

      </HubsContainer>
    </ScrollablePageWrapper>
  )
}

const PREFIX = 'hubs'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': { color: theme.palette.blue },
}))

const HubsContainer = styled('div')(({ theme }) => ({
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

export default Hubs