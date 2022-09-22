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
import NinaSdk from '@nina-protocol/nina-sdk'

const ExchangeContext = createContext()
const ExchangeContextProvider = ({ children }) => {
  const {
    addReleaseToCollection,
    removeReleaseFromCollection,
    getUsdcBalance,
    ninaClient,
  } = useContext(Nina.Context)
  const { getRelease } = useContext(Release.Context)
  const { removeTrackFromPlaylist } = useContext(Audio.Context)
  const [exchangeState, setExchangeState] = useState({})
  const [exchangeInitPending, setExchangeInitPending] = useState({})

  const {
    exchangeAccept,
    exchangeCancel,
    exchangeInit,
    getExchange,
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
          new anchor.web3.PublicKey(exchange.initializerExpectedMint)
        )

      const [takerExpectedTokenAccount, takerExpectedTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          new anchor.web3.PublicKey(exchange.initializerSendingMint)
        )

      const [
        initializerExpectedTokenAccount,
        initializerExpectedTokenAccountIx,
      ] = await findOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.publicKey,
        new anchor.web3.PublicKey(exchange.initializer),
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        new anchor.web3.PublicKey(exchange.initializerExpectedMint)
      )

      const exchangeHistory = anchor.web3.Keypair.generate()
      const createExchangeHistoryIx =
        await program.account.exchangeHistory.createInstruction(exchangeHistory)

      const request = {
        accounts: {
          initializer: new anchor.web3.PublicKey(exchange.initializer),
          initializerExpectedTokenAccount,
          takerExpectedTokenAccount,
          takerSendingTokenAccount,
          exchangeEscrowTokenAccount: new anchor.web3.PublicKey(exchange.exchangeEscrowTokenAccount),
          exchangeSigner: new anchor.web3.PublicKey(exchange.exchangeSigner),
          taker: provider.wallet.publicKey,
          exchange: new anchor.web3.PublicKey(exchange.publicKey),
          exchangeHistory: exchangeHistory.publicKey,
          release: new anchor.web3.PublicKey(releasePubkey),
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
      await getUsdcBalance()
      await getExchange(exchange.publicKey.toBase58(), true, txid)

      return {
        success: true,
        msg: 'Offer accepted!',
      }
    } catch (error) {
      await getExchangesForRelease(releasePubkey, exchangeId)
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
      const releaseMint = releaseAccount.releaseMintSeed
      console.log('releaseMint', releaseMint.toBase58())
      console.log('releaseAccount', releaseAccount)

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
      console.log('initializerSendingMint', initializerSendingMint)
      console.log('initializerExpectedMint', initializerExpectedMint)

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

      await getUsdcBalance()
      await getExchange(exchange.publicKey.toBase58(), true, txid)

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
          new anchor.web3.PublicKey(exchange.initializerSendingMint)
        )

      const request = {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerSendingTokenAccount: initializerReturnTokenAccount,
          exchangeEscrowTokenAccount: new anchor.web3.PublicKey(exchange.exchangeEscrowTokenAccount),
          exchangeSigner: new anchor.web3.PublicKey(exchange.exchangeSigner),
          exchange: new anchor.web3.PublicKey(exchange.publicKey),
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
        addReleaseToCollection(exchange.release)
      }

      await getUsdcBalance()
      await getExchange(exchange.publicKey.toBase58(), true, txid)

      return {
        success: true,
        msg: 'Offer cancelled!',
      }
    } catch (error) {
      await getExchangesForRelease(exchange.release)
      return ninaErrorHandler(error)
    }
  }

  /*

  EXCHANGE PROGRAM RPC LOOKUPS

  */

  const getExchange = async (publicKey, withAccountInfo=false, transactionId) => {
    const { exchange } = await NinaSdk.Exchange.fetch(publicKey, withAccountInfo, transactionId)
    const updatedExchangeState = { ...exchangeState }
    if (exchange.accountData) {
      updatedExchangeState[publicKey] = {
        ...updatedExchangeState[publicKey],
        ...exchange.accountData,
      }
    }
    updatedExchangeState[publicKey] = {
      ...updatedExchangeState[publicKey],
      ...exchange,
    }
    setExchangeState(updatedExchangeState)
  }

  const getExchangesForUser = async (publicKey, withAccountData=false) => {
    try {
      const { exchanges } = await NinaSdk.Account.fetchExchanges(publicKey, withAccountData)
      const updatedExchangeState = {...exchangeState}
      exchanges.forEach((exchange) => {
        if (exchange.accountData) {
          updatedExchangeState[exchange.publicKey] = {
            ...updatedExchangeState[exchange.publicKey],
            ...exchange.accountData
          }
          delete exchange.accountData
        }
        updatedExchangeState[exchange.publicKey] = {
          ...updatedExchangeState[exchange.publicKey],
          ...exchange,
        }
        setExchangeState(updatedExchangeState)
      })
    } catch (err) {
      console.warn(err)
    }
  }

  const getExchangesForRelease = async (publicKey, withAccountData=false) => {
    try {
      const { exchanges } = await NinaSdk.Release.fetchExchanges(publicKey, withAccountData)
      const updatedExchangeState = {...exchangeState}
      exchanges.forEach((exchange) => {  
        if (exchange.accountData) {
          updatedExchangeState[exchange.publicKey] = {
            ...updatedExchangeState[exchange.publicKey],
            ...exchange.accountData
          }
          delete exchange.accountData
        }

        const exchangeItem = {
          ...exchange,
          isCurrentUser:
            exchange.initializer ===
            provider.wallet?.publicKey?.toBase58(),
        }
        exchangeItem.amount = exchange.isSelling
          ? exchange.expectedAmount
          : exchange.initializerAmount

        updatedExchangeState[exchange.publicKey] = {
          ...updatedExchangeState[exchange.publicKey],
          ...exchangeItem,
        }
        setExchangeState(updatedExchangeState)
      })
    } catch (err) {
      console.warn(err)
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
        (e) =>
          e.initializer === provider.wallet?.publicKey.toBase58()
      )
    }

    if (isBuy) {
      return exchanges
        .filter((e) => !e.isSelling)
        .sort(
          (e1, e2) =>
            e1.initializerAmount - e2.initializerAmount
        )
    } else {
      return exchanges
        .filter((e) => e.isSelling)
        .sort(
          (e1, e2) =>
            e1.expectedAmount - e2.expectedAmount
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