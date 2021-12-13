import React from 'react'
import { styled } from '@mui/material/styles'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import ReleaseCreate from './components/ReleaseCreate'
import ReleaseList from './components/ReleaseList'
import UserCollection from './components/UserCollection'
import Release from './components/Release'
import AudioPlayer from './components/AudioPlayer'
import HomePage from './components/HomePage'
import FaqPage from './components/FaqPage'
import NavBar from './components/NavBar'
import AllReleases from './components/AllReleases'
import ReleaseRelated from './components/ReleaseRelated'

function Routes() {
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
            <NavBar />
            <Switch>
              <Route exact path="/upload" component={ReleaseCreate} />
              <Route path="/faq" component={FaqPage} />
              <Route path="/collection" component={UserCollection}></Route>

              <Route
                exact
                path="/releases/:releasePubkey/market"
                component={Release}
              />
              <Route
                exact
                path="/releases/:releasePubkey"
                component={Release}
              />
              <Route path="/releases" component={ReleaseList}></Route>
              <Route path="/allReleases" component={AllReleases}></Route>
              <Route
                exact
                path="/collection/:releasePubkey/market"
                component={Release}
              />
              <Route
                path="/collection/:releasePubkey"
                component={Release}
              ></Route>
              <Route
                path="/:releasePubkey/related"
                component={ReleaseRelated}
              ></Route>
              <Route path="/:releasePubkey/market" component={Release}></Route>
              <Route path="/:releasePubkey" component={Release}></Route>
              <Route exact path="/" component={HomePage} />
            </Switch>
            <AudioPlayer />
          </div>
        </Container>
      </BrowserRouter>
    </Root>
  )
}

const PREFIX = 'Routes'

const classes = {
  mainContainer: `${PREFIX}-mainContainer`,
  bodyContainer: `${PREFIX}-bodyContainer`,
}

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

export default Routes
