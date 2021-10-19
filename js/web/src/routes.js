import React from 'react'
import { styled } from '@mui/material/styles';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import ReleaseCreate from './components/ReleaseCreate'
import ReleaseList from './components/ReleaseList'
import UserCollection from './components/UserCollection'
import Release from './components/Release'
import AudioPlayer from './components/AudioPlayer'
import NavBar from './components/NavBar'
import NavDrawer from './components/NavDrawer'
import HomePage from './components/HomePage'

const PREFIX = 'Routes';

const classes = {
  mainContainer: `${PREFIX}-mainContainer`,
  bodyContainer: `${PREFIX}-bodyContainer`
};

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
  }
}));

function Routes() {


  return (
    (<Root>
      <CssBaseline />
      <BrowserRouter>
        <Container
          maxWidth={false}
          disableGutters
          className={classes.mainContainer}
        >
          <div className={classes.bodyContainer}>
            <NavBar />
            <NavDrawer />
            <Switch>
              <Route exact path="/upload" component={ReleaseCreate} />
              <Route path="/releases" component={ReleaseList}></Route>
              <Route path="/collection" component={UserCollection}></Route>
              <Route exact path="/release/:releasePubkey" component={Release} />
              <Route path="/" component={HomePage}></Route>
            </Switch>
          </div>
          <AudioPlayer />
        </Container>
      </BrowserRouter>
    </Root>)
  );
}

export default Routes
