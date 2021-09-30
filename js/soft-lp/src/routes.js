import { useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Slp from './components/Slp'
import CountdownLanding from './components/CountdownLanding'
import SlpAbout from './components/SlpAbout'
import React from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

const RELEASE_DATE = new Date(1633032000000).toLocaleString()

function Routes() {
  const classes = useStyles()
  const [releaseIsLive, setReleaseIsLive] = useState(Date.now() >= RELEASE_DATE)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <>
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
    </>
  )
}
const useStyles = makeStyles(() => ({
  mainContainer: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  bodyContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    textAlign: 'center',
    height: '100%',
  },
}))

export default Routes
