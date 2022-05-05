import React, {useContext, useEffect, useMemo} from 'react'
import nina from '@nina-protocol/nina-sdk'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import HubSlider from './HubSlider'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { HubContext } = nina.contexts

const Hubs = () => {
  const { getHubs, hubState } = useContext(HubContext)
  const hubs = useMemo(() => Object.values(hubState).sort((a,b) => new Date(b.datetime) - new Date(a.datetime)), [hubState])
  
  useEffect(() => {
    getHubs()
  }, [])

  return (
    <ScrollablePageWrapper>
      <HubsContainer overflowX="visible">
        <Box sx={{ padding: { md: '0 40px 140px 40px', xs: '30px 0px' } }}>
          <Box sx={{ paddingLeft: { md: '30px', xs: '0' } }}>
            <Typography
              variant="body1"
              align="left"
              className={classes.sectionHeader}
            >
              Hubs
            </Typography>
          </Box>
          <HubSlider hubs={hubs} />
        </Box>
      </HubsContainer>
    </ScrollablePageWrapper>
  )
}

const PREFIX = 'hubs'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

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