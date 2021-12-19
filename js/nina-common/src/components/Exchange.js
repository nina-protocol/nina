import React, { useContext, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { Typography, Box, Fade, Button } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useWallet } from '@solana/wallet-adapter-react'
import BuySell from './BuySell'
import ExchangeHistoryModal from './ExchangeHistoryModal'
import ExchangeList from './ExchangeList'
import ExchangeModal from './ExchangeModal'

import {
  ConnectionContext,
  ExchangeContext,
  ReleaseContext,
  NinaContext,
  AudioPlayerContext,
} from '../contexts'
import NinaClient from '../utils/client'

const Exchange = (props) => {
  const { releasePubkey, metadata, track } = props

  const wallet = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const { releaseState, getRelease } = useContext(ReleaseContext)
  const {
    exchangeState,
    getExchangesForRelease,
    exchangeAccept,
    exchangeCancel,
    exchangeInit,
    exchangeStateHistory,
    filterExchangesForReleaseBuySell,
    filterExchangeMatch,
    getExchangeHistoryForRelease,
    filterExchangeHistoryForRelease,
  } = useContext(ExchangeContext)
  const { connection } = useContext(ConnectionContext)
  const { getSolPrice } = useContext(NinaContext)
  const { updateTxid, addTrackToQueue } = useContext(AudioPlayerContext)

  const [exchangeAwaitingConfirm, setExchangeAwaitingConfirm] =
    useState(undefined)
  const [exchangesBuy, setExchangesBuy] = useState(undefined)
  const [exchangesSell, setExchangesSell] = useState(undefined)
  const [exchangeHistory, setExchangeHistory] = useState(undefined)
  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey])
  const [updateTime, setUpdateTime] = useState(Date.now())

  useEffect(() => {
    getRelease(releasePubkey)
    refreshExchange()
  }, [])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    setExchangesBuy(filterExchangesForReleaseBuySell(releasePubkey, true))
    setExchangesSell(filterExchangesForReleaseBuySell(releasePubkey, false))
  }, [exchangeState, releasePubkey, filterExchangesForReleaseBuySell])

  useEffect(() => {
    setExchangeHistory(filterExchangeHistoryForRelease(releasePubkey))
  }, [exchangeStateHistory, filterExchangeHistoryForRelease, releasePubkey])

  const handleExchangeAction = async (exchange) => {
    let result
    if (exchange.isInit) {
      showPendingTransaction('Making an offer...')
      result = await exchangeInit(exchange)
      setExchangeAwaitingConfirm(undefined)
    } else if (exchange.isCurrentUser) {
      showPendingTransaction('Cancelling offer...')
      result = await exchangeCancel(exchange, wallet?.connected, connection)
    } else {
      if (exchange.isSelling) {
        showPendingTransaction('Accepting offer...')
        result = await exchangeAccept(exchange, releasePubkey)
      } else {
        if (exchangeAwaitingConfirm) {
          showPendingTransaction('Accepting offer...')
          result = await exchangeAccept(exchange, releasePubkey)
          setExchangeAwaitingConfirm(undefined)
        } else {
          setExchangeAwaitingConfirm(exchange)
        }
      }
    }

    if (result) {
      showCompletedTransaction(result)
    }
  }

  const onExchangeInitSubmit = async (e, isBuy, amount) => {
    e.preventDefault()

    let result
    const data = {
      releasePubkey,
      amount: NinaClient.uiToNative(amount, release.paymentMint),
      isSelling: !isBuy,
      isInit: true,
    }

    const exchangeCompletedByInput = filterExchangeMatch(
      data.amount,
      isBuy,
      releasePubkey
    )
    if (exchangeCompletedByInput) {
      if (exchangeCompletedByInput.isCurrentUser) {
        result = {
          msg: 'New offer invalid - would complete own existing offer',
          success: false,
        }
      } else {
        if (isBuy) {
          showPendingTransaction('Accepting an offer...')
          result = await exchangeAccept(exchangeCompletedByInput, releasePubkey)
        } else {
          setExchangeAwaitingConfirm(exchangeCompletedByInput)
        }
      }
    } else if (!isBuy) {
      setExchangeAwaitingConfirm(data)
    } else {
      showPendingTransaction('Making an offer...')
      result = await exchangeInit(data)
    }

    if (result) {
      showCompletedTransaction(result)
    }
  }

  const showPendingTransaction = (msg) => {
    enqueueSnackbar(msg, {
      variant: 'info',
    })
  }

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'success' : 'warn',
    })
  }

  const refreshExchange = () => {
    getExchangesForRelease(releasePubkey)
    getExchangeHistoryForRelease(releasePubkey)
    getSolPrice()
    setUpdateTime(Date.now())
  }

  if (!release) {
    return null
  }

  return (
    <>
      <ExchangeWrapper>
        <StyledReleaseInfo>
          <ReleaseImage>
            {metadata && <img src={metadata.image} alt={metadata.name} />}
          </ReleaseImage>

          <InfoCopy>
            {track && (
              <CtaWrapper sx={{ display: 'flex' }}>
                <Button
                  onClick={() =>
                    updateTxid(
                      track.properties.files[0].uri,
                      releasePubkey,
                      true
                    )
                  }
                  sx={{ height: '22px', width: '28px' }}
                >
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
                </Button>
                <Button
                  onClick={() => {
                    addTrackToQueue(releasePubkey)
                  }}
                  sx={{ height: '22px', width: '28px' }}
                >
                  <ControlPointIcon sx={{ color: 'white' }} />
                </Button>
              </CtaWrapper>
            )}

            {metadata && (
              <Fade in={true}>
                <Typography variant="h4" color="white" align="left">
                  {metadata?.properties?.artist || metadata?.artist},{' '}
                  <i>{metadata?.properties?.title || metadata?.title}</i>
                </Typography>
              </Fade>
            )}
          </InfoCopy>
        </StyledReleaseInfo>

        <StyledExchange>
          <BuySell
            {...props}
            symbol={metadata?.symbol}
            release={release}
            isBuy={true}
            onSubmit={(exchange, isBuy, amount) =>
              onExchangeInitSubmit(exchange, isBuy, amount)
            }
          />
          <ExchangeList
            list={exchangesBuy}
            onExchangeButtonAction={handleExchangeAction}
            release={release}
            isBuy={true}
            metadata={metadata}
          />
        </StyledExchange>

        <StyledExchange>
          <BuySell
            {...props}
            symbol={metadata?.symbol}
            release={release}
            isBuy={false}
            onSubmit={(exchange, isBuy, amount) =>
              onExchangeInitSubmit(exchange, isBuy, amount)
            }
          />
          <ExchangeList
            list={exchangesSell}
            onExchangeButtonAction={handleExchangeAction}
            release={release}
            isBuy={false}
            metadata={metadata}
          />
        </StyledExchange>

        <ExchangeCopy>
          <Typography className="viewMore" variant="subtitle1" align="left">
            {exchangesBuy?.length > 6
              ? `Scroll to view ${exchangesBuy.length - 6} offers...`
              : ''}
          </Typography>

          <HistoryCtaWrapper sx={{ display: 'flex' }}>
            <ExchangeHistoryModal
              exchangeHistory={exchangeHistory}
              release={release}
            />
            <Typography
              variant="subtitle1"
              onClick={refreshExchange}
              sx={{ cursor: 'pointer' }}
            >
              Last Updated:{' '}
              <span>{new Date(updateTime).toLocaleTimeString()} </span>
              <RefreshIcon fontSize="10px" sx={{ fontSize: '10px' }} />
            </Typography>
          </HistoryCtaWrapper>

          <Typography className="viewMore" variant="subtitle1" align="right">
            {exchangesSell?.length > 6
              ? `Scroll to view ${exchangesSell.length - 6} listings...`
              : ''}
          </Typography>
        </ExchangeCopy>

        {exchangeAwaitingConfirm && (
          <ExchangeModal
            toggleOverlay={() => setExchangeAwaitingConfirm(undefined)}
            showOverlay={exchangeAwaitingConfirm !== undefined}
            release={release}
            onSubmit={() => handleExchangeAction(exchangeAwaitingConfirm)}
            amount={
              exchangeAwaitingConfirm?.initializerAmount ||
              exchangeAwaitingConfirm?.amount
            }
            cancelTransaction={() => setExchangeAwaitingConfirm(undefined)}
            isAccept={true}
            metadata={metadata}
          />
        )}
      </ExchangeWrapper>
    </>
  )
}

const PREFIX = 'Exchange'

const classes = {
  buySellContainer: `${PREFIX}-buySellContainer`,
  scrollCopyContainer: `${PREFIX}-scrollCopyContainer`,
  scrollCopy: `${PREFIX}-scrollCopy`,
  updateMessage: `${PREFIX}-updateMessage`,
}
const ExchangeWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  display: 'grid',
  gridTemplateRows: '1fr 418px 20px',
  gridTemplateColumns: 'repeat(2, 310px)',
  alignItems: 'center',
  gridRowGap: theme.spacing(1),
  justifyContent: 'space-between',
  overflowX: 'scroll',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '74vh',
    marginBottom: '100px',
  },
  [`& .${classes.updateMessage}`]: {
    fontSize: '10px',
    position: 'absolute',
    bottom: '18px',
    lineHeight: '11.5px',
    left: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      color: `${theme.palette.blue}`,
      paddingLeft: '4px',
    },
    '& svg': {
      fontSize: '12px',
      paddingLeft: '4px',
    },
  },
}))

const StyledReleaseInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.blue,
  color: theme.palette.blue,
  height: '84px',
  position: 'relative',
  display: 'flex',
  padding: theme.spacing(1),
  gridColumn: '1/3',
  [theme.breakpoints.down('md')]: {
    minHeight: '54px',
    height: 'unset',
    width: '100%',
  },
}))

const InfoCopy = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}))

const ReleaseImage = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '82px',
  '& img': {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '54px',
    width: '30px',
    paddingLeft: '15px',
  },
}))

const StyledExchange = styled(Box)(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

const ExchangeCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridColumn: '1/3',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '& .viewMore': {
      display: 'none',
    },
  },
}))

const HistoryCtaWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  '& .MuiSvgIcon-root': {
    height: '10px',
    width: '10px',
  },
}))

const CtaWrapper = styled(Box)(() => ({
  '& .MuiButton-root': {
    width: '21px',
    marginRight: '10px',
  },
}))

export default Exchange
