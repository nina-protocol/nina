import React, { useState, useContext, useEffect, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { withRouter, useHistory } from 'react-router-dom'

import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'

const { ExchangeContext, ReleaseContext } = ninaCommon.contexts
const NinaClient = ninaCommon.utils.NinaClient

const SlpControls = (props) => {
  const { activeIndex, setActiveIndex, releasePubkey, location } = props
  const history = useHistory()
  const wallet = useWallet()

  const { releaseState } = useContext(ReleaseContext)
  const {
    exchangeState,
    getExchangesForRelease,
    filterExchangesForReleaseMarketPrice,
  } = useContext(ExchangeContext)
  const [release, setRelease] = useState(undefined)
  const [marketPrice, setMarketPrice] = useState(undefined)
  const [userIsPublisher, setUserIsPublisher] = useState(false)
  const ref0 = useRef(null)
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)

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

  useEffect(() => {
    setUserIsPublisher(
      wallet?.publicKey?.toBase58() ===
        releaseState.tokenData[releasePubkey]?.authority.toBase58()
    )
  }, [wallet?.connected, releasePubkey, releaseState.tokenData[releasePubkey]])

  const handleClick = (e, i) => {
    if (location.pathname === '/about') {
      history.push('/')
    }
    e.preventDefault()
    setActiveIndex(i)
  }

  return (
    <Root>
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
          {wallet?.connected && userIsPublisher && (
            <Box className={classes.ctaWrapper}>
              <Button
                id="3"
                ref={ref3}
                onClick={(e) => handleClick(e, 3)}
                disableripple="true"
                className={` ${classes.cta} ${classes.cta}--3 ${
                  activeIndex === 3 ? `${classes.cta}--active` : null
                }`}
              >
                Settings
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </Root>
  )
}

const PREFIX = 'SlpControls'

const classes = {
  root: `${PREFIX}-root`,
  ctaWrapper: `${PREFIX}-ctaWrapper`,
  cta: `${PREFIX}-cta`,
  marketPrice: `${PREFIX}-marketPrice`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    top: '0',
    left: '0',
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.ctaWrapper}`]: {
    zIndex: 20,
  },

  [`& .${classes.cta}`]: {
    zIndex: 20,
    padding: `${theme.spacing(2, 1)}`,
    width: '100%',
    fontSize: '12px',
    lineHeight: '13.8px',
    '&--active': {
      color: `${theme.palette.blue}`,
    },
    '&:hover': {
      background: `${theme.palette.white}`,
      color: `${theme.palette.blue}`,
    },
    [theme.breakpoints.down('md')]: {
      padding: '1rem',
    },
  },

  [`& .${classes.marketPrice}`]: {
    color: `${theme.palette.blue}`,
    paddingLeft: '5px',
  },
}))

export default withRouter(SlpControls)
