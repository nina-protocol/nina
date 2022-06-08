import React, { useContext, useEffect, useState, useMemo } from 'react'
import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import CssBaseline from '@mui/material/CssBaseline'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import nina from '@nina-protocol/nina-sdk'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { lightThemeOptions } from '../styles/theme/lightThemeOptions'

import Dots from './Dots'
const HubCreate = dynamic(() => import('./HubCreate'))
const Navigation = dynamic(() => import('./Navigation'))
const AudioPlayer = dynamic(() => import('./AudioPlayer'))
const { HubContext, NinaContext } = nina.contexts
const lightTheme = createTheme(lightThemeOptions)

const Layout = ({ children }) => {
  const router = useRouter()
  const [hubPubkey, setHubPubkey] = useState()
  const { hubState, getHubPubkeyForHubHandle } = useContext(HubContext)
  
  useEffect(() => {
    const getHubPubkey = async (handle) => {
      const id = await getHubPubkeyForHubHandle(handle)
      setHubPubkey(id)
    }
    getHubPubkey(router.query.hubPubkey)
  }, [router.query.hubPubkey])
  console.log("hubPubkey ::> ", hubPubkey)
  // if (!hubState[hubPubkey]?.metadata) {
  //   return (
  //     <Box width="100%" display="flex" justifyContent="center" height="100vh">
  //       <Dots size="80px" />
  //     </Box>
  //   )
  // }


  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  useEffect(() => {
    if (!router.pathname.includes('dashboard') && router.route !== '/') {
      if (hubData?.json.backgroundColor) {
        lightTheme.palette.background.default = hubData.json.backgroundColor
      }
      if (hubData?.json.textColor) {
        lightTheme.palette.text.primary = hubData.json.textColor
        lightTheme.palette.primary.main = hubData.json.textColor
        lightTheme.components.MuiTypography.styleOverrides.root.color =
          hubData.json.textColor
        lightTheme.components.MuiCssBaseline.styleOverrides.a.color =
          hubData.json.textColor
      }
    } else {
      lightTheme.palette.background.default = '#ffffff'
      lightTheme.palette.text.primary = '#000000'
      lightTheme.palette.primary.main = '#000000'
      lightTheme.components.MuiTypography.styleOverrides.root.color = '#000000'
      lightTheme.components.MuiCssBaseline.styleOverrides.a.color = '#000000'
    }
  }, [hubData, router])

  if (children.props.isEmbed) {
    return <main className={classes.bodyContainer}>{children}</main>
  }

  let topSpace = '125px'

  if (router.pathname.includes('/releases')) {
    topSpace = '80px'
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Root>
        <CssBaseline>
          <Container
            maxWidth={false}
            disableGutters
            className={classes.mainContainer}
          >
            <main className={classes.bodyContainer}>
              <Navigation hubPubkey={hubPubkey} />
              <Grid
                container
                columns={{ xs: 12, sm: 12, md: 12 }}
                sx={{
                  marginTop: { md: topSpace, xs: '0px' },
                  minHeight: `calc(100% - ${topSpace})`,
                  justifyContent: { xs: 'center' },
                }}
              >
                {children}
              </Grid>
              <AudioPlayerWrapper>
                <AudioPlayer />
              </AudioPlayerWrapper>
            </main>
          </Container>
        </CssBaseline>
      </Root>
    </ThemeProvider>
  )
}

const PREFIX = 'Layout'

const classes = {
  mainContainer: `${PREFIX}-mainContainer`,
  bodyContainer: `${PREFIX}-bodyContainer`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.mainContainer}`]: {
    minHeight: '100vh',
    height: '100vh',
    width: '100vw',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  [`& .${classes.bodyContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    textAlign: 'center',
    minHeight: '100%',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      overflow: 'scroll',
    },
  },
}))

const AudioPlayerWrapper = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  paddingLeft: '8px',
  textAlign: 'left',
  paddingBottom: theme.spacing(1),
}))
export default Layout
