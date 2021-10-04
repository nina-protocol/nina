import React, { useContext, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { Typography, Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Refresh'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'
import BuySell from './BuySell'
import ExchangeHistoryModal from './ExchangeHistoryModal'
import ExchangeList from './ExchangeList'
import ExchangeModal from './ExchangeModal'
import {
  ConnectionContext,
  ExchangeContext,
  ReleaseContext,
  NinaContext
} from '../contexts'
import NinaClient from '../utils/client'

const Exchange = (props) => {
  const { releasePubkey, metadata } = props
  const classes = useStyles()
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
      if (isBuy) {
        showPendingTransaction()
        result = await exchangeAccept(exchangeCompletedByInput, releasePubkey)
      } else {
        setExchangeAwaitingConfirm(exchangeCompletedByInput)
      }
    } else if (!isBuy) {
      setExchangeAwaitingConfirm(data)
    } else {
      showPendingTransaction()
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
      <ExchangeHistoryModal
        exchangeHistory={exchangeHistory}
        release={release}
      />
      <div className={classes.exchangeWrapper}>
        <Box className={classes.buySellContainer}>
          <BuySell
            {...props}
            release={release}
            isBuy={true}
            onSubmit={(exchange, isBuy, amount) =>
              onExchangeInitSubmit(exchange, isBuy, amount)
            }
          />
          <BuySell
            {...props}
            release={release}
            isBuy={false}
            onSubmit={(exchange, isBuy, amount) =>
              onExchangeInitSubmit(exchange, isBuy, amount)
            }
          />
        </Box>
        <div className={classes.exchange}>
          <Box className={classes.exchangeListContainer}>
            <Box className={classes.listWrapper}>
              <ExchangeList
                list={exchangesBuy}
                onExchangeButtonAction={handleExchangeAction}
                release={release}
                isBuy={true}
                metadata={metadata}
              />
            </Box>

            <Box className={classes.listWrapper}>
              <ExchangeList
                list={exchangesSell}
                onExchangeButtonAction={handleExchangeAction}
                release={release}
                isBuy={false}
                metadata={metadata}
              />
            </Box>
          </Box>
        </div>
        <Box className={classes.scrollCopyContainer}>
          <Typography className={classes.scrollCopy}>
            {exchangesBuy?.length > 7
              ? `Scroll to view ${exchangesBuy.length - 7} offers...`
              : ''}
          </Typography>
          <Typography className={classes.scrollCopy}>
            {exchangesSell?.length > 7
              ? `Scroll to view ${exchangesSell.length - 7} listings...`
              : ''}
          </Typography>
        </Box>
        <Typography className={classes.updateMessage} onClick={refreshExchange}>
          Last Updated:{' '}
          <span>{new Date(updateTime).toLocaleTimeString()} </span>
          <RefreshIcon fontSize="small" />
        </Typography>

        {exchangeAwaitingConfirm && (
          <ExchangeModal
            toggleOverlay={() => setExchangeAwaitingConfirm(undefined)}
            showOverlay={exchangeAwaitingConfirm}
            release={release}
            onSubmit={() => handleExchangeAction(exchangeAwaitingConfirm)}
            amount={
              exchangeAwaitingConfirm?.initializerAmount ||
              exchangeAwaitingConfirm?.amount
            }
            cancelTransaction={() => setExchangeAwaitingConfirm(undefined)}
            isAccept={true}
          />
        )}
      </div>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  exchangeWrapper: {
    margin: 'auto',
    height: '570px',
    overflow: 'hidden',
    width: '750px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '154px 304px 75px',
    alignItems: 'center',
    marginTop: `${theme.spacing(6)}px`,
    [theme.breakpoints.down('sm')]: {
      width: '98%',
      gridTemplateColumns: '50% 50%',
      gridTemplateRows: '1fr 50vh',
      alignItems: 'flex-start',
      height: 'auto',
      marginTop: '0px',
    },
  },
  exchange: {
    height: '100%',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1/3',
    },
  },
  buySellContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1/3',
    },
  },
  exchangeListContainer: {
    display: 'flex',
    height: '100%',
    justifyContent: 'space-between',
  },
  listWrapper: {
    width: '100%',
    maxWidth: '310px',
    [theme.breakpoints.down('sm')]: {
      padding: '0.5rem',
    },
  },
  scrollCopyContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  scrollCopy: {
    width: '310px',
    textAlign: 'left',
    fontSize: '10px',
  },
  updateMessage: {
    fontSize: '10px',
    position: 'absolute',
    bottom: '18px',
    lineHeight: '11.5px',
    left: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      color: `${theme.vars.blue}`,
      paddingLeft: '4px',
    },
    '& svg': {
      fontSize: '12px',
      paddingLeft: '4px',
    },
  },
}))

export default Exchange
