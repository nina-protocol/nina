import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Slp from './components/Slp'
import CountdownLanding from './components/CountdownLanding'
import SlpAbout from './components/SlpAbout'
import React from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

const PREFIX = 'Routes'

const classes = {
  mainContainer: `${PREFIX}-mainContainer`,
  bodyContainer: `${PREFIX}-bodyContainer`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(() => ({
  [`& .${classes.mainContainer}`]: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },

  [`& .${classes.bodyContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    textAlign: 'center',
    height: '100%',
  },
}))

const RELEASE_DATE = new Date('2021-09-30T20:00:00Z')

function Routes() {
  const [releaseIsLive, setReleaseIsLive] = useState(Date.now() >= RELEASE_DATE)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <Root>
      <CssBaseline />
      <BrowserRouter>
        <Container
          maxWidth={false}
          disableGutters
          className={classes.mainContainer}
        >
          <div className={classes.bodyContainer}>
            {releaseIsLive && (
              <NavBar
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            )}
            <Switch>
              {releaseIsLive && (
                <Route
                  exact
                  path={'/about'}
                  render={() => <SlpAbout />}
                ></Route>
              )}
              <Route
                path="/"
                render={() =>
                  releaseIsLive ? (
                    <Slp
                      activeIndex={activeIndex}
                      setActiveIndex={setActiveIndex}
                    />
                  ) : (
                    <CountdownLanding
                      releaseDate={RELEASE_DATE}
                      setReleaseIsLive={setReleaseIsLive}
                    />
                  )
                }
              ></Route>
            </Switch>
            {releaseIsLive && <Footer />}
          </div>
        </Container>
      </BrowserRouter>
    </Root>
  )
}

export default Routes
