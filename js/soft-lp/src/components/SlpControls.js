import React, { useState, useContext, useEffect, useRef } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Box from '@material-ui/core/Box'
import ninaCommon from 'nina-common'

const { ExchangeContext, ReleaseContext } = ninaCommon.contexts
const NinaClient = ninaCommon.utils.NinaClient

const SlpControls = (props) => {
  const { activeIndex, setActiveIndex, releasePubkey, location } = props
  let history = useHistory()

  const classes = useStyles()
  const { releaseState } = useContext(ReleaseContext)
  const {
    exchangeState,
    getExchangesForRelease,
    filterExchangesForReleaseMarketPrice,
  } = useContext(ExchangeContext)
  const [release, setRelease] = useState(undefined)
  const [marketPrice, setMarketPrice] = useState(undefined)
  const ref0 = useRef(null)
  const ref1 = useRef(null)
  const ref2 = useRef(null)

  useEffect(() => {
    getExchangesForRelease(releasePubkey)
    setRelease(releaseState.tokenData[releasePubkey])
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    if (release) {
      const mp = filterExchangesForReleaseMarketPrice(releasePubkey)
      if (mp) {
        setMarketPrice(NinaClient.nativeToUiString(mp, release?.paymentMint))
      } else {
        setMarketPrice(undefined)
      }
    }
  }, [
    exchangeState[releasePubkey],
    release,
    filterExchangesForReleaseMarketPrice,
  ])

  const handleClick = (e, i) => {
    if (location.pathname === '/about') {
      history.push('/')
    }
    e.preventDefault()
    setActiveIndex(i)
  }

  return (
    <>
      <Fade in={true} timeout={100}>
        <Box className={classes.root}>
          <Box className={classes.ctaWrapper}>
            <Button
              id="0"
              ref={ref0}
              onClick={(e) => handleClick(e, 0)}
              disableripple="true"
              className={` ${classes.cta} ${classes.cta}--0 ${
                activeIndex === 0 ? `${classes.cta}--active` : null
              }`}
            >
              Purchase
            </Button>
          </Box>
          <Box className={classes.ctaWrapper}>
            <Button
              id="1"
              ref={ref1}
              onClick={(e) => handleClick(e, 1)}
              disableripple="true"
              className={` ${classes.cta} ${classes.cta}--1 ${
                activeIndex === 1 ? `${classes.cta}--active` : null
              }`}
            >
              Market{' '}
              {marketPrice && (
                <span className={classes.marketPrice}>({marketPrice})</span>
              )}
            </Button>
          </Box>
          <Box className={classes.ctaWrapper}>
            <Button
              id="2"
              ref={ref2}
              onClick={(e) => handleClick(e, 2)}
              disableripple="true"
              className={` ${classes.cta} ${classes.cta}--2 ${
                activeIndex === 2 ? `${classes.cta}--active` : null
              }`}
            >
              Redeem
            </Button>
          </Box>
        </Box>
      </Fade>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    top: '0',
    left: '0',
    paddingLeft: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  ctaWrapper: {
    zIndex: 20,
  },
  cta: {
    zIndex: 20,
    padding: `${theme.spacing(2, 1)}`,
    width: '100%',
    fontSize: '12px',
    lineHeight: '13.8px',
    '&--active': {
      color: `${theme.vars.blue}`,
    },
    '&:hover': {
      background: `${theme.vars.white}`,
      color: `${theme.vars.blue}`,
    },
    [theme.breakpoints.down('sm')]: {
      padding: '1rem',
    },
  },
  marketPrice: {
    color: `${theme.vars.blue}`,
    paddingLeft: '5px',
  },
}))

export default withRouter(SlpControls)
