import React, { createContext, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import Audio from '../Audio'
import Nina from '../Nina'
import Release from '../Release'
import {
  findOrCreateAssociatedTokenAccount,
  wrapSol,
  TOKEN_PROGRAM_ID,
} from '../../utils/web3'
import { ninaErrorHandler } from '../../utils/errors'
import NinaSdk from '@nina-protocol/js-sdk'

const ExchangeContext = createContext()
const ExchangeContextProvider = ({ children }) => {
  const {
    addReleaseToCollection,
    removeReleaseFromCollection,
    getUserBalances,
    ninaClient,
    setVerificationState,
  } = useContext(Nina.Context)
  const { getRelease } = useContext(Release.Context)
  const { removeTrackFromPlaylist } = useContext(Audio.Context)
  const [exchangeState, setExchangeState] = useState({})
  const [exchangeInitPending, setExchangeInitPending] = useState({})

  const {
    exchangeAccept,
    exchangeCancel,
    exchangeInit,
    getExchangesForUser,
    getExchangesForRelease,
    filterExchangesForUser,
    filterExchangesForRelease,
    filterExchangeHistoryForRelease,
    filterExchangesForReleaseBuySell,
    filterExchangesForReleaseMarketPrice,
    filterExchangeMatch,
  } = exchangeContextHelper({
    ninaClient,
    exchangeState,
    setExchangeState,
    exchangeInitPending,
    setExchangeInitPending,
    addReleaseToCollection,
    removeReleaseFromCollection,
    removeTrackFromPlaylist,
    getRelease,
    getUserBalances,
    setVerificationState,
  })

  return (
    <ExchangeContext.Provider
      value={{
        exchangeState,
        exchangeAccept,
        exchangeCancel,
        exchangeInit,
        exchangeInitPending,
        getExchangesForUser,
        getExchangesForRelease,
        filterExchangesForUser,
        filterExchangesForRelease,
        filterExchangeHistoryForRelease,
        filterExchangesForReleaseBuySell,
        filterExchangesForReleaseMarketPrice,
        filterExchangeMatch,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  )
}

const exchangeContextHelper = ({
  ninaClient,
  exchangeState,
  setExchangeState,
  exchangeInitPending,
  setExchangeInitPending,
  addReleaseToCollection,
  removeReleaseFromCollection,
  getUserBalances,
  setVerificationState,
}) => {
  const { provider } = ninaClient

  const exchangeAccept = async (exchange, releasePubkey) => {
    try {
      const exchangeAccept = await NinaSdk.Exchange.exchangeAccept(
        ninaClient,
        exchange,
        releasePubkey
      )
      console.log('exchange.publicKey', exchange.publicKey)
      console.log('exchangeAccept.txid', exchangeAccept)
      if (exchange.isSelling) {
        addReleaseToCollection(releasePubkey)
      } else {
        removeReleaseFromCollection(releasePubkey, exchange.releaseMint)
      }
      await getUserBalances()
      await getExchange(exchange.publicKey, false, exchangeAccept.txid)
      await getExchangesForRelease(releasePubkey, exchange.publicKey)

      return {
        success: true,
        msg: 'Offer accepted!',
      }
    } catch (error) {
      console.warn('exchangeAccept error', error)
      await getExchangesForRelease(releasePubkey, exchange.publicKey)
      return ninaErrorHandler(error)
    }
  }

  const exchangeInit = async ({ amount, isSelling, releasePubkey }) => {
    setExchangeInitPending({
      ...exchangeInitPending,
      [releasePubkey]: true,
    })
    try {
      const exchange = await NinaSdk.Exchange.exchangeInit(
        ninaClient,
        amount,
        isSelling,
        releasePubkey
      )

      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      if (isSelling) {
        removeReleaseFromCollection(releasePubkey, exchange.releaseMint)
      }

      await getUserBalances()
      await getExchange(exchange.publicKey, true, exchange.txid)

      return {
        success: true,
        msg: 'Offer created!',
      }
    } catch (error) {
      console.warn(error)
      await getExchangesForRelease(releasePubkey)
      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      return ninaErrorHandler(error)
    }
  }

  const exchangeCancel = async (exchange, releasePubkey) => {
    try {
      const exchangeCancel = await NinaSdk.Exchange.exchangeCancel(
        ninaClient,
        exchange,
        releasePubkey
      )
      console.log('exchangeCancel.txid', exchangeCancel.txid)
      if (exchange.isSelling) {
        addReleaseToCollection(releasePubkey)
      }

      await getUserBalances()
      await getExchange(
        exchangeCancel.exchangePubkey.toBase58(),
        false,
        exchangeCancel.txid
      )
      await getExchangesForRelease(releasePubkey)

      return {
        success: true,
        msg: 'Offer cancelled!',
      }
    } catch (error) {
      await getExchangesForRelease(releasePubkey)
      return ninaErrorHandler(error)
    }
  }

  /*

  EXCHANGE PROGRAM RPC LOOKUPS

  */

  const getExchange = async (
    publicKey,
    withAccountInfo = true,
    transactionId
  ) => {
    const { exchange } = await NinaSdk.Exchange.fetch(
      publicKey,
      withAccountInfo,
      transactionId
    )
    const updatedExchangeState = {}
    if (exchange.accountData) {
      updatedExchangeState[publicKey] = {
        ...updatedExchangeState[publicKey],
        ...exchange.accountData,
      }
    }
    updatedExchangeState[publicKey] = {
      ...updatedExchangeState[publicKey],
      ...formatExchange(exchange),
    }
    setExchangeState((prevState) => ({
      ...prevState,
      ...updatedExchangeState,
    }))
  }

  const getExchangesForUser = async (publicKey, withAccountData = true) => {
    try {
      const { exchanges } = await NinaSdk.Account.fetchExchanges(
        publicKey,
        withAccountData
      )
      const updatedExchangeState = { ...exchangeState }
      exchanges.forEach((exchange) => {
        if (exchange.accountData) {
          updatedExchangeState[exchange.publicKey] = {
            ...updatedExchangeState[exchange.publicKey],
            ...exchange.accountData,
          }
        }
        updatedExchangeState[exchange.publicKey] = {
          ...updatedExchangeState[exchange.publicKey],
          ...formatExchange(exchange),
        }
      })
      setExchangeState(updatedExchangeState)
    } catch (err) {
      console.warn(err)
    }
  }

  const getExchangesForRelease = async (publicKey, withAccountData = true) => {
    try {
      const { exchanges } = await NinaSdk.Release.fetchExchanges(
        publicKey,
        withAccountData
      )
      const updatedExchangeState = {}
      const updatedVerificationState = {}
      exchanges.forEach((exchange) => {
        if (exchange.accountData) {
          updatedExchangeState[exchange.publicKey] = {
            ...updatedExchangeState[exchange.publicKey],
            ...exchange.accountData,
          }
        }

        updatedExchangeState[exchange.publicKey] = {
          ...updatedExchangeState[exchange.publicKey],
          ...formatExchange(exchange),
        }

        if (exchange.initializer.verifications) {
          updatedVerificationState[exchange.initializer.publicKey] =
            exchange.initializer.verifications
        }

        if (exchange.completedBy?.verifications) {
          updatedVerificationState[exchange.completedBy.publicKey] =
            exchange.completedBy?.verifications
        }
      })
      setVerificationState((prevState) => ({
        ...prevState,
        ...updatedVerificationState,
      }))

      setExchangeState((prevState) => ({
        ...prevState,
        ...updatedExchangeState,
      }))
    } catch (err) {
      console.warn(err)
    }
  }

  const formatExchange = (exchange) => {
    const exchangeItem = {
      ...exchange,
      isCurrentUser:
        exchange.initializer.publicKey ===
        provider.wallet?.publicKey?.toBase58(),
    }
    exchangeItem.amount = exchange.isSale
      ? exchange.expectedAmount * 1000000
      : exchange.initializerAmount * 1000000
    exchangeItem.isSelling = exchange.isSale

    return exchangeItem
  }

  const filterExchangeMatch = (price, isBuy, releasePubkey) => {
    let match = undefined
    let exchanges = filterExchangesForReleaseBuySell(releasePubkey, !isBuy)
    price = ninaClient.nativeToUi(price, ninaClient.ids.mints.usdc)
    exchanges?.forEach((exchange) => {
      // If the exchanges are on opposite sides of the market
      if (exchange.isSelling === isBuy) {
        // If current user is looking to buy record-coin
        if (isBuy) {
          // If current users offer is higher than a sale offer and less than the distribution price
          if (price >= exchange.expectedAmount) {
            // If there hasn't been a matching condition where current users price completes an exchange
            if (!match) {
              match = exchange
            } else {
              // If this exchange is lower than previously matched exchange
              if (
                Number(exchange.expectedAmount) < Number(match.expectedAmount)
              ) {
                match = exchange
              }
            }
          }
        } else {
          // If current users sale offer is less than an existing buy
          if (price <= Number(exchange.initializerAmount)) {
            if (!match) {
              match = exchange
            } else {
              // If this exchange is higher than previously matched exchange
              if (
                Number(exchange.initializerAmount) >
                Number(match.initializerAmount)
              ) {
                match = exchange
              }
            }
          }
        }
      }
    })
    return match
  }

  /*

  STATE FILTERS

  */

  const filterExchangesForRelease = (releasePubkey) => {
    const exchanges = []
    Object.keys(exchangeState).forEach((exchangePubkey) => {
      const exchange = exchangeState[exchangePubkey]
      if (exchange?.release === releasePubkey) {
        exchanges.push(exchange)
      }
    })
    return exchanges
  }

  const filterExchangesForReleaseMarketPrice = (releasePubkey) => {
    let marketPrice = undefined
    Object.keys(exchangeState).forEach((exchangePubkey) => {
      const exchange = exchangeState[exchangePubkey]
      if (exchange.release === releasePubkey) {
        if (exchange.isSelling) {
          if (marketPrice) {
            if (exchange.expectedAmount.toNumber() < marketPrice) {
              marketPrice = exchange.expectedAmount
            }
          } else {
            marketPrice = exchange.expectedAmount
          }
        }
      }
    })
    return marketPrice
  }
  const filterExchangeHistoryForRelease = (releasePubkey) => {
    const exchanges = []
    Object.keys(exchangeState).forEach((exchangePubkey) => {
      const exchange = exchangeState[exchangePubkey]
      if (exchange?.release === releasePubkey) {
        if (exchange.completedBy) {
          exchanges.push(exchange)
        }
      }
    })
    return exchanges
  }

  const filterExchangesForReleaseBuySell = (
    releasePubkey,
    isBuy,
    isUser = false
  ) => {
    let exchanges = filterExchangesForRelease(releasePubkey)
    if (isUser) {
      if (!provider.wallet?.connected) {
        return []
      }

      exchanges = exchanges.filter(
        (e) => e.initializer === provider.wallet?.publicKey.toBase58()
      )
    }

    if (isBuy) {
      return exchanges
        .filter((e) => !e.isSelling && !e.cancelled && !e.completedBy)
        .sort((e1, e2) => e1.initializerAmount - e2.initializerAmount)
    } else {
      return exchanges
        .filter((e) => e.isSelling && !e.cancelled && !e.completedBy)
        .sort((e1, e2) => e1.expectedAmount - e2.expectedAmount)
    }
  }

  const filterExchangesForUser = () => {
    const exchanges = []
    Object.keys(exchangeState).forEach((exchangePubkey) => {
      const exchange = exchangeState[exchangePubkey]
      if (exchange.isCurrentUser) {
        exchanges.push(exchange)
      }
    })
    return exchanges
  }

  /*

  STATE MANAGEMENT

  */

  return {
    exchangeAccept,
    exchangeInit,
    exchangeCancel,
    getExchange,
    getExchangesForUser,
    getExchangesForRelease,
    filterExchangeMatch,
    filterExchangesForUser,
    filterExchangesForRelease,
    filterExchangeHistoryForRelease,
    filterExchangesForReleaseBuySell,
    filterExchangesForReleaseMarketPrice,
  }
}

export default {
  Context: ExchangeContext,
  Provider: ExchangeContextProvider,
}
