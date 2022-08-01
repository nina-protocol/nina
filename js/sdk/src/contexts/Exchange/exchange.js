import React, { createContext, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import { NinaContext } from '../Nina'
import { ReleaseContext } from '../Release'
import { AudioPlayerContext } from '../Audio'
import {
  getProgramAccounts,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
  TOKEN_PROGRAM_ID,
} from '../../utils/web3'
import { ninaErrorHandler } from '../../utils/errors'
import { dateConverter } from '../../utils'

const lookupTypes = {
  RELEASE: 'release',
  USER: 'user',
}

export const ExchangeContext = createContext()
export const ExchangeContextProvider = ({ children }) => {
  const {
    addReleaseToCollection,
    removeReleaseFromCollection,
    getUsdcBalance,
    ninaClient,
  } = useContext(NinaContext)
  const { getRelease } = useContext(ReleaseContext)
  const { removeTrackFromPlaylist } = useContext(AudioPlayerContext)
  const [exchangeState, setExchangeState] = useState({})
  const [exchangeHistoryState, setExchangeHistoryState] = useState({})
  const [exchangeInitPending, setExchangeInitPending] = useState({})

  const {
    exchangeAccept,
    exchangeCancel,
    exchangeInit,
    getExchangesForUser,
    getExchangesForRelease,
    filterExchangesForUser,
    filterExchangesForRelease,
    filterExchangesForReleaseBuySell,
    filterExchangesForReleaseMarketPrice,
    filterExchangeMatch,
    getExchangeHistoryForUser,
    getExchangeHistoryForRelease,
    filterExchangeHistoryForUser,
    filterExchangeHistoryForRelease,
  } = exchangeContextHelper({
    ninaClient,
    exchangeState,
    setExchangeState,
    exchangeHistoryState,
    setExchangeHistoryState,
    exchangeInitPending,
    setExchangeInitPending,
    addReleaseToCollection,
    removeReleaseFromCollection,
    removeTrackFromPlaylist,
    getRelease,
    getUsdcBalance,
  })

  return (
    <ExchangeContext.Provider
      value={{
        exchangeState,
        exchangeAccept,
        exchangeCancel,
        exchangeInit,
        exchangeInitPending,
        exchangeHistoryState,
        getExchangesForUser,
        getExchangesForRelease,
        filterExchangesForUser,
        filterExchangesForRelease,
        filterExchangesForReleaseBuySell,
        filterExchangesForReleaseMarketPrice,
        filterExchangeMatch,
        getExchangeHistoryForUser,
        getExchangeHistoryForRelease,
        filterExchangeHistoryForUser,
        filterExchangeHistoryForRelease,
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
  exchangeHistoryState,
  setExchangeHistoryState,
  exchangeInitPending,
  setExchangeInitPending,
  addReleaseToCollection,
  removeReleaseFromCollection,
  getRelease,
  getUsdcBalance,
}) => {
  const { provider } = ninaClient

  const exchangeAccept = async (exchange, releasePubkey) => {
    try {
      const program = await ninaClient.useProgram()
      const VAULT_ID = new anchor.web3.PublicKey(ninaClient.ids.accounts.vault)
      const vault = await program.account.vault.fetch(VAULT_ID)
      const release = await program.account.release.fetch(
        new anchor.web3.PublicKey(releasePubkey)
      )

      const [takerSendingTokenAccount, takerSendingTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          exchange.initializerExpectedMint
        )

      const [takerExpectedTokenAccount, takerExpectedTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          exchange.initializerSendingMint
        )

      const [
        initializerExpectedTokenAccount,
        initializerExpectedTokenAccountIx,
      ] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        exchange.initializer,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        exchange.initializerExpectedMint
      )

      const exchangeHistory = anchor.web3.Keypair.generate()
      const createExchangeHistoryIx =
        await program.account.exchangeHistory.createInstruction(exchangeHistory)

      const request = {
        accounts: {
          initializer: exchange.initializer,
          initializerExpectedTokenAccount,
          takerExpectedTokenAccount,
          takerSendingTokenAccount,
          exchangeEscrowTokenAccount: exchange.exchangeEscrowTokenAccount,
          exchangeSigner: exchange.exchangeSigner,
          taker: provider.wallet.publicKey,
          exchange: exchange.publicKey,
          exchangeHistory: exchangeHistory.publicKey,
          release: releasePubkey,
          vault: VAULT_ID,
          vaultTokenAccount: ninaClient.isUsdc(release.paymentMint)
            ? vault.usdcVault
            : vault.wrappedSolVault,
          vaultSigner: vault.vaultSigner,
          royaltyTokenAccount: release.royaltyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [exchangeHistory],
        instructions: [createExchangeHistoryIx],
      }

      if (takerSendingTokenAccountIx) {
        request.instructions.push(takerSendingTokenAccountIx)
      }
      if (takerExpectedTokenAccountIx) {
        request.instructions.push(takerExpectedTokenAccountIx)
      }
      if (initializerExpectedTokenAccountIx) {
        request.instructions.push(initializerExpectedTokenAccountIx)
      }

      if (ninaClient.isSol(release.paymentMint) && exchange.isSelling) {
        const { instructions, signers } = await wrapSol(
          provider,
          exchange.expectedAmount
        )
        request.instructions.push(...instructions)
        request.signers.push(...signers)
        request.accounts.takerSendingTokenAccount = signers[0].publicKey
      }

      const params = {
        expectedAmount: exchange.expectedAmount,
        initializerAmount: exchange.initializerAmount,
        resalePercentage: release.resalePercentage,
        datetime: new anchor.BN(Date.now() / 1000),
      }

      const txid = await program.methods
        .exchangeAccept(params)
        .accounts(request.accounts)
        .preInstructions(request.instructions)
        .signers(request.signers)
        .rpc()
      await provider.connection.getParsedTransaction(txid, 'confirmed')

      if (exchange.isSelling) {
        addReleaseToCollection(releasePubkey)
      } else {
        removeReleaseFromCollection(
          releasePubkey,
          exchange.releaseMint.toBase58()
        )
      }

      await getUpdates(releasePubkey, exchange.publicKey.toBase58())
      return {
        success: true,
        msg: 'Offer accepted!',
      }
    } catch (error) {
      await getUpdates(releasePubkey, exchange.publicKey.toBase58())
      return ninaErrorHandler(error)
    }
  }

  const exchangeInit = async ({ amount, isSelling, releasePubkey }) => {
    setExchangeInitPending({
      ...exchangeInitPending,
      [releasePubkey]: true,
    })
    try {
      const program = await ninaClient.useProgram()
      let initializerSendingMint = null
      let initializerExpectedMint = null
      let expectedAmount = null
      let initializerAmount = null

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await program.account.release.fetch(release)
      const releaseMint = releaseAccount.releaseMint
      if (isSelling) {
        expectedAmount = new anchor.BN(amount)
        initializerSendingMint = releaseMint
        initializerAmount = new anchor.BN(1)
        initializerExpectedMint = releaseAccount.paymentMint
      } else {
        expectedAmount = new anchor.BN(1)
        initializerSendingMint = releaseAccount.paymentMint
        initializerAmount = new anchor.BN(amount)
        initializerExpectedMint = releaseMint
      }

      const exchange = anchor.web3.Keypair.generate()

      const [exchangeSigner, bump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [exchange.publicKey.toBuffer()],
          program.programId
        )

      const [initializerSendingTokenAccount, initializerSendingTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          initializerSendingMint
        )

      const [exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          exchangeSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          initializerSendingMint
        )

      const [
        initializerExpectedTokenAccount,
        initializerExpectedTokenAccountIx,
      ] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        initializerExpectedMint
      )

      const exchangeCreateIx = await program.account.exchange.createInstruction(
        exchange
      )

      const request = {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint,
          initializerExpectedTokenAccount,
          initializerSendingTokenAccount,
          initializerExpectedMint,
          initializerSendingMint,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [exchange],
        instructions: [exchangeCreateIx, exchangeEscrowTokenAccountIx],
      }

      if (initializerExpectedTokenAccountIx) {
        request.instructions.push(initializerExpectedTokenAccountIx)
      }

      if (initializerSendingTokenAccountIx) {
        request.instructions.push(initializerSendingTokenAccountIx)
      }

      if (ninaClient.isSol(releaseAccount.paymentMint) && !isSelling) {
        const { instructions, signers } = await wrapSol(
          provider,
          initializerAmount
        )
        if (!request.instructions) {
          request.instructions = [...instructions]
        } else {
          request.instructions.push(...instructions)
        }
        request.signers.push(...signers)
        request.accounts.initializerSendingTokenAccount = signers[0].publicKey
      }

      const config = {
        expectedAmount,
        initializerAmount,
        isSelling,
      }

      const txid = await program.methods
        .exchangeInit(config, bump)
        .accounts(request.accounts)
        .preInstructions(request.instructions)
        .signers(request.signers)
        .rpc()
      await provider.connection.getParsedTransaction(txid, 'confirmed')

      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      if (isSelling) {
        removeReleaseFromCollection(releasePubkey, releaseMint.toBase58())
      }

      await getUpdates(releasePubkey, exchange.publicKey.toBase58())

      return {
        success: true,
        msg: 'Offer created!',
      }
    } catch (error) {
      console.warn(error)
      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      return ninaErrorHandler(error)
    }
  }

  const exchangeCancel = async (exchange) => {
    try {
      const program = await ninaClient.useProgram()
      const [initializerReturnTokenAccount, initializerReturnTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          exchange.initializerSendingMint
        )

      const request = {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerSendingTokenAccount: initializerReturnTokenAccount,
          exchangeEscrowTokenAccount: exchange.exchangeEscrowTokenAccount,
          exchangeSigner: exchange.exchangeSigner,
          exchange: exchange.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }

      if (initializerReturnTokenAccountIx) {
        request.instructions = [initializerReturnTokenAccountIx]
      }

      let txid
      const params = new anchor.BN(
        exchange.isSelling ? 1 : exchange.initializerAmount
      )

      if (ninaClient.isSol(exchange.initializerSendingMint)) {
        txid = await program.methods
          .exchangeCancelSol(params)
          .accounts(request.accounts)
          .preInstructions(request.instructions || [])
          .signers(request.signers || [])
          .rpc()
      } else {
        txid = await program.methods
          .exchangeCancel(params)
          .accounts(request.accounts)
          .preInstructions(request.instructions || [])
          .signers(request.signers || [])
          .rpc()
      }
      await provider.connection.getParsedTransaction(txid, 'confirmed')

      if (exchange.isSelling) {
        addReleaseToCollection(exchange.release.publicKey.toBase58())
      }

      await getUpdates(
        exchange.release.publicKey.toBase58(),
        exchange.publicKey.toBase58()
      )
      return {
        success: true,
        msg: 'Offer cancelled!',
      }
    } catch (error) {
      await getUpdates(
        exchange.release.publicKey.toBase58(),
        exchange.publicKey.toBase58()
      )
      return ninaErrorHandler(error)
    }
  }

  /*

  EXCHANGE PROGRAM RPC LOOKUPS

  */

  const getExchangesHandler = async (
    type,
    releasePubkey = null,
    exchangeId = null
  ) => {
    if (!provider.connection) {
      return
    }
    let path = ninaClient.endpoints.api
    switch (type) {
      case lookupTypes.USER:
        path += `/userAccounts/${provider.wallet.publicKey.toBase58()}/exchanges`
        break
      case lookupTypes.RELEASE:
        if (exchangeId) {
          path += `/releases/${releasePubkey}/exchanges?exchangeId=${exchangeId}`
        } else {
          path += `/releases/${releasePubkey}/exchanges`
        }
        break
    }
    const response = await fetch(path)
    const exchangeIds = await response.json()
    if (exchangeIds.length > 0) {
      const program = await ninaClient.useProgram()
      const exchangeAccounts = await anchor.utils.rpc.getMultipleAccounts(
        provider.connection,
        exchangeIds.map((id) => new anchor.web3.PublicKey(id)),
        'confirmed'
      )

      const existingExchanges = []
      const layout = program.coder.accounts.accountLayouts.get('Exchange')
      exchangeAccounts.forEach((exchange) => {
        if (exchange) {
          let dataParsed = layout.decode(exchange.account.data.slice(8))
          dataParsed.publicKey = exchange.publicKey
          existingExchanges.push(dataParsed)
        }
      })

      const releaseExchangeIds = existingExchanges.map((exchange) =>
        exchange.publicKey.toBase58()
      )
      const idsToRemove = Object.keys(exchangeState).filter(
        (id) => !releaseExchangeIds.includes(id)
      )
      if (exchangeAccounts.error) {
        throw exchangeAccounts.error
      } else {
        saveExchangesToState(existingExchanges, idsToRemove)
      }
    } else {
      if (releasePubkey) {
        const releaseExchangeIds = filterExchangesForRelease(releasePubkey).map(
          (e) => e.publicKey.toBase58()
        )
        saveExchangesToState([], releaseExchangeIds)
      }
    }
  }

  const getExchangesForUser = async () => {
    if (!provider.wallet?.connected) {
      return
    }
    getExchangesHandler(lookupTypes.USER)
  }

  const getExchangesForRelease = async (releasePubkey, exchangeId = null) => {
    getExchangesHandler(lookupTypes.RELEASE, releasePubkey, exchangeId)
  }

  const getExchangeHistoryForRelease = async (releasePubkey) => {
    const program = await ninaClient.useProgram()
    let exchangeHistoryAccounts = await getProgramAccounts(
      program,
      'ExchangeHistory',
      { release: releasePubkey },
      provider.connection
    )

    exchangeHistoryAccounts = exchangeHistoryAccounts.map((e) => {
      e.dateFormatted = dateConverter(e.datetime)
      return e
    })

    if (exchangeHistoryAccounts.error) {
      throw exchangeHistoryAccounts.error
    } else {
      saveExchangeHistoryToState(exchangeHistoryAccounts)
    }
  }

  const getExchangeHistoryForUser = async () => {
    if (!provider.wallet?.connected) {
      return
    }
    const program = await ninaClient.useProgram()
    const exchangeHistoryAccountsBuy = await getProgramAccounts(
      program,
      'ExchangeHistory',
      { buyer: provider.wallet?.publicKey.toBase58() },
      provider.connection
    )

    const exchangeHistoryAccountsSell = await getProgramAccounts(
      program,
      'ExchangeHistory',
      { seller: provider.wallet?.publicKey.toBase58() },
      provider.connection
    )

    if (
      !exchangeHistoryAccountsBuy.error &&
      !exchangeHistoryAccountsSell.error
    ) {
      saveExchangeHistoryToState([
        ...exchangeHistoryAccountsBuy,
        ...exchangeHistoryAccountsSell,
      ])
    }
  }

  const filterExchangeMatch = (price, isBuy, releasePubkey) => {
    let match = undefined
    let exchanges = filterExchangesForReleaseBuySell(releasePubkey, !isBuy)
    exchanges?.forEach((exchange) => {
      // If the exchanges are on opposite sides of the market
      if (exchange.isSelling === isBuy) {
        // If current user is looking to buy record-coin
        if (isBuy) {
          // If current users offer is higher than a sale offer and less than the distribution price
          if (price >= exchange.expectedAmount.toNumber()) {
            // If there hasn't been a matching condition where current users price completes an exchange
            if (!match) {
              match = exchange
            } else {
              // If this exchange is lower than previously matched exchange
              if (
                exchange.expectedAmount.toNumber() <
                match.expectedAmount.toNumber()
              ) {
                match = exchange
              }
            }
          }
        } else {
          // If current users sale offer is less than an existing buy
          if (price <= exchange.initializerAmount.toNumber()) {
            if (!match) {
              match = exchange
            } else {
              // If this exchange is higher than previously matched exchange
              if (
                exchange.initializerAmount.toNumber() >
                match.initializerAmount.toNumber()
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
      if (exchange?.release?.toBase58() === releasePubkey) {
        exchanges.push(exchange)
      }
    })
    return exchanges
  }

  const filterExchangesForReleaseMarketPrice = (releasePubkey) => {
    let marketPrice = undefined
    Object.keys(exchangeState).forEach((exchangePubkey) => {
      const exchange = exchangeState[exchangePubkey]
      if (exchange.release.toBase58() === releasePubkey) {
        if (exchange.isSelling) {
          if (marketPrice) {
            if (exchange.expectedAmount.toNumber() < marketPrice) {
              marketPrice = exchange.expectedAmount.toNumber()
            }
          } else {
            marketPrice = exchange.expectedAmount.toNumber()
          }
        }
      }
    })
    return marketPrice
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
        (e) =>
          e.initializer.toBase58() === provider.wallet?.publicKey.toBase58()
      )
    }

    if (isBuy) {
      return exchanges
        .filter((e) => !e.isSelling)
        .sort(
          (e1, e2) =>
            e1.initializerAmount.toNumber() - e2.initializerAmount.toNumber()
        )
    } else {
      return exchanges
        .filter((e) => e.isSelling)
        .sort(
          (e1, e2) =>
            e1.expectedAmount.toNumber() - e2.expectedAmount.toNumber()
        )
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

  const filterExchangeHistoryForRelease = (releasePubkey) => {
    const exchangeHistory = []
    Object.keys(exchangeHistoryState).forEach((pubkey) => {
      const history = exchangeHistoryState[pubkey]
      if (history.release.toBase58() === releasePubkey) {
        exchangeHistory.push(history)
      }
    })
    exchangeHistory.sort((a, b) => b.datetime - a.datetime)
    return exchangeHistory
  }

  const filterExchangeHistoryForUser = () => {
    if (!provider.wallet?.connected) {
      return
    }

    const exchangeHistory = []
    Object.keys(exchangeHistoryState).forEach((pubkey) => {
      const history = exchangeHistoryState[pubkey]
      if (
        history.seller.toBase58() === provider.wallet?.publicKey.toBase58() ||
        history.buyer.toBase58() === provider.wallet?.publicKey.toBase58()
      ) {
        exchangeHistory.push(history)
      }
    })
    return exchangeHistory
  }

  /*

  STATE MANAGEMENT

  */

  const saveExchangesToState = (exchanges, idsToRemove) => {
    const updatedExchangeState = { ...exchangeState }

    idsToRemove.forEach((id) => {
      delete updatedExchangeState[id]
    })

    exchanges.forEach((exchange) => {
      const exchangeItem = {
        ...exchange,
        isCurrentUser:
          exchange.initializer.toBase58() ===
          provider.wallet?.publicKey?.toBase58(),
      }
      exchangeItem.amount = exchange.isSelling
        ? exchange.expectedAmount
        : exchange.initializerAmount

      updatedExchangeState[exchange.publicKey.toBase58()] = exchangeItem
    })

    setExchangeState({
      ...updatedExchangeState,
    })
  }

  const saveExchangeHistoryToState = (exchangeHistory) => {
    const updatedExchangeHistoryState = { ...exchangeHistoryState }

    exchangeHistory.forEach((history) => {
      updatedExchangeHistoryState[history.publicKey.toBase58()] = history
    })
    setExchangeHistoryState({
      ...updatedExchangeHistoryState,
    })
  }

  const getUpdates = async (releasePubkey, exchangeId = null) => {
    await getUsdcBalance()
    await getRelease(releasePubkey)
    await getExchangesForRelease(releasePubkey, exchangeId)
  }

  return {
    exchangeAccept,
    exchangeInit,
    exchangeCancel,
    getExchangesForUser,
    getExchangesForRelease,
    filterExchangeMatch,
    filterExchangesForUser,
    filterExchangesForRelease,
    filterExchangesForReleaseBuySell,
    filterExchangesForReleaseMarketPrice,
    getExchangeHistoryForUser,
    getExchangeHistoryForRelease,
    filterExchangeHistoryForUser,
    filterExchangeHistoryForRelease,
  }
}