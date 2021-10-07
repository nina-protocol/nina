import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import ReleaseCreate from './components/ReleaseCreate'
import ReleaseList from './components/ReleaseList'
import Release from './components/Release'
import AudioPlayer from './components/AudioPlayer'
import NavBar from './components/NavBar'

function Routes() {
  const classes = useStyles()

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
            <NavBar />
            <Switch>
              <Route exact path="/upload" component={ReleaseCreate} />
              <Route exact path="/release/:releasePubkey" component={Release} />
              <Route path="/" component={ReleaseList}></Route>
            </Switch>
          </div>
          <AudioPlayer />
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
