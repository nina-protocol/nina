import { useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Home from './components/Home'
import React from 'react'

function Routes() {
  const classes = useStyles()
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
            <Switch>
              <Route
                path="/"
                component={Home}
              />
            </Switch>
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
