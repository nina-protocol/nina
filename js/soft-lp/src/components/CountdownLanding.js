import React from 'react'
import { styled } from '@mui/material/styles'
import Countdown from 'react-countdown'
import Box from '@mui/material/Box'

import { Typography } from '@mui/material'
import softLpLogo from '../assets/soft-lp-logo.png'

const CountdownLanding = (props) => {
  const { setReleaseIsLive, releaseDate } = props

  const countDownRenderer = (props) => {
    const { days, hours, minutes, seconds } = props

    return (
      <StyledBox>
        <Typography className={classes.clock}>
          <span>{days}d</span>
          <span>{hours}hr</span>
          <span>{minutes}m</span>
          <span>{seconds}s</span>
        </Typography>
      </StyledBox>
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

const PREFIX = 'CountdownLanding'

const classes = {
  root: `${PREFIX}-root`,
  logo: `${PREFIX}-logo`,
  clockWrapper: `${PREFIX}-clockWrapper`,
  container: `${PREFIX}-container`,
  clock: `${PREFIX}-clock`,
  cta: `${PREFIX}-cta`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.root}`]: {
    width: '100%',
    height: '100%',
    zIndex: '1000',
    backgroundColor: 'white',
  },

  [`& .${classes.logo}`]: {
    height: '27px',
    zIndex: '10',
  },

  [`& .${classes.clockWrapper}`]: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  [`& .${classes.container}`]: {
    position: 'relative',
    height: '200px',
    width: '600px',
    display: 'flex',
  },

  [`& .${classes.clock}`]: {
    fontSize: '20px',
    color: theme.palette.blue,
    textShadow: '0 0 4px #FFFFFF',
    display: 'flex',
    paddingTop: '10px',
    '& span': {
      textAlign: 'left',
      paddingLeft: '10px',
    },
  },

  [`& .${classes.cta}`]: {
    color: `${theme.palette.white} !important`,
    background: `${theme.palette.blue} !important`,
    fontSize: '40px',
    padding: `${theme.spacing(2, 2)} !important`,
  },
}))

export default CountdownLanding
