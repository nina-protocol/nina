import React from 'react'
import Countdown from 'react-countdown'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import softLpLogo from '../assets/soft-lp-logo.png'

const CountdownLanding = (props) => {
  const { setReleaseIsLive, releaseDate } = props
  const classes = useStyles()

  const countDownRenderer = (props) => {
    const { days, hours, minutes, seconds } = props

    return (
      <Box>
        <Typography className={classes.clock}>
          <span>{days}d</span>
          <span>{hours}hr</span>
          <span>{minutes}m</span>
          <span>{seconds}s</span>
        </Typography>
      </Box>
    )
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.clockWrapper}>
        <img className={classes.logo} src={softLpLogo} />
        <Countdown
          date={releaseDate}
          renderer={countDownRenderer}
          onComplete={() => setReleaseIsLive(true)}
        />
      </Box>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    zIndex: '1000',
    backgroundColor: 'white',
  },
  logo: {
    height: '27px',
    zIndex: '10',
  },
  clockWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    height: '200px',
    width: '600px',
    display: 'flex',
  },
  clock: {
    fontSize: '20px',
    color: theme.vars.blue,
    textShadow: '0 0 4px #FFFFFF',
    display: 'flex',
    paddingTop: '10px',
    '& span': {
      textAlign: 'left',
      paddingLeft: '10px',
    },
  },
  cta: {
    color: `${theme.vars.white} !important`,
    background: `${theme.vars.blue} !important`,
    fontSize: '40px',
    padding: `${theme.spacing(2, 2)} !important`,
  },
}))

export default CountdownLanding
