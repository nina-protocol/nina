import { createContext, useState, useContext } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'
import { AudioPlayerContext } from './audio'
import {
  getProgramAccounts,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
} from '../utils/web3'
import { ninaErrorHandler } from '../utils/errors'
import NinaClient from '../utils/client'

const lookupTypes = {
  RELEASE: 'release',
  USER: 'user',
}

export const ExchangeContext = createContext()
const ExchangeContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { connection } = useContext(ConnectionContext)
  const {
    addReleaseToCollection,
    removeReleaseFromCollection,
    getUsdcBalance,
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
    exchangeState,
    setExchangeState,
    exchangeHistoryState,
    setExchangeHistoryState,
    exchangeInitPending,
    setExchangeInitPending,
    wallet,
    connection,
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
  exchangeState,
  setExchangeState,
  exchangeHistoryState,
  setExchangeHistoryState,
  exchangeInitPending,
  setExchangeInitPending,
  wallet,
  connection,
  addReleaseToCollection,
  removeReleaseFromCollection,
  getRelease,
  getUsdcBalance,
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const exchangeAccept = async (exchange, releasePubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      const VAULT_ID = new anchor.web3.PublicKey(
        NinaClient.ids().accounts.vault
      )
      const vault = await nina.program.account.vault.fetch(VAULT_ID)
      const release = await nina.program.account.release.fetch(
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
        await nina.program.account.exchangeHistory.createInstruction(
          exchangeHistory
        )

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
          vaultTokenAccount: NinaClient.isUsdc(release.paymentMint)
            ? vault.usdcVault
            : vault.wrappedSolVault,
          vaultSigner: vault.vaultSigner,
          royaltyTokenAccount: release.royaltyTokenAccount,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
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

      if (NinaClient.isSol(release.paymentMint) && exchange.isSelling) {
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

      const txid = await nina.program.rpc.exchangeAccept(params, request)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      if (exchange.isSelling) {
        addReleaseToCollection(releasePubkey)
      } else {
        removeReleaseFromCollection(
          releasePubkey,
          exchange.releaseMint.toBase58()
        )
      }

      getUsdcBalance()
      getRelease(releasePubkey)
      getExchangesForRelease(releasePubkey)

      return {
        success: true,
        msg: 'Offer accepted!',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const exchangeInit = async ({ amount, isSelling, releasePubkey }) => {
    setExchangeInitPending({
      ...exchangeInitPending,
      [releasePubkey]: true,
    })
    try {
      const nina = await NinaClient.connect(provider)
      let initializerSendingMint = null
      let initializerExpectedMint = null
      let expectedAmount = null
      let initializerAmount = null

      const release = new anchor.web3.PublicKey(releasePubkey)
      const releaseAccount = await nina.program.account.release.fetch(release)
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
          nina.program.programId
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

      const exchangeCreateIx =
        await nina.program.account.exchange.createInstruction(exchange)

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
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
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

      if (NinaClient.isSol(releaseAccount.paymentMint) && !isSelling) {
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

      const txid = await nina.program.rpc.exchangeInit(config, bump, request)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      // addExchangeToStateTemp({
      //   releasePubkey,
      //   isSelling,
      //   amount,
      //   exchangeId: exchange.publicKey,
      // })

      if (isSelling) {
        removeReleaseFromCollection(releasePubkey, releaseMint.toBase58())
      }

      getUsdcBalance()
      getRelease(releasePubkey)
      getExchangesForRelease(releasePubkey)

      return {
        success: true,
        msg: 'Offer created!',
      }
    } catch (error) {
      setExchangeInitPending({
        ...exchangeInitPending,
        [releasePubkey]: false,
      })

      return ninaErrorHandler(error)
    }
  }

  const exchangeCancel = async (exchange) => {
    try {
      const nina = await NinaClient.connect(provider)
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
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
        },
      }

      if (initializerReturnTokenAccountIx) {
        request.instructions = [initializerReturnTokenAccountIx]
      }

      let txid
      if (NinaClient.isSol(exchange.initializerSendingMint)) {
        txid = await nina.program.rpc.exchangeCancelSol(
          new anchor.BN(exchange.isSelling ? 1 : exchange.initializerAmount),
          request
        )
      } else {
        txid = await nina.program.rpc.exchangeCancel(
          new anchor.BN(exchange.isSelling ? 1 : exchange.initializerAmount),
          request
        )
      }
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      if (exchange.isSelling) {
        addReleaseToCollection(exchange.release.publicKey.toBase58())
      }

      getUsdcBalance()
      getRelease(exchange.release.publicKey.toBase58())
      getExchangesForRelease(exchange.release.publicKey.toBase58())

      return {
        success: true,
        msg: 'Offer cancelled!',
      }
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  /*

  EXCHANGE PROGRAM RPC LOOKUPS

  */

  const getExchangesHandler = async (type, releasePubkey = null) => {
    if (!connection) {
      return
    }

    let path = NinaClient.endpoints.api
    switch (type) {
      case lookupTypes.USER:
        path += `/userAccounts/${wallet.publicKey.toBase58()}/exchanges`
        break
      case lookupTypes.RELEASE:
        path += `/releases/${releasePubkey}/exchanges`
        break
    }
    const response = await fetch(path)
    const exchangeIds = await response.json()
    if (exchangeIds.length > 0) {
      const nina = await NinaClient.connect(provider)
      const exchangeAccounts = await anchor.utils.rpc.getMultipleAccounts(
        connection,
        exchangeIds.map((id) => new anchor.web3.PublicKey(id))
      )

      const existingExchanges = []
      const layout = nina.program.coder.accounts.accountLayouts.get('Exchange')
      exchangeAccounts.forEach((exchange) => {
        if (exchange) {
          let dataParsed = layout.decode(exchange.account.data.slice(8))
          dataParsed.publicKey = exchange.publicKey
          existingExchanges.push(dataParsed)
        }
      })

      const existingExchangeIds = existingExchanges.map((exchange) =>
        exchange.publicKey.toBase58()
      )
      const releaseExchangeIds = filterExchangesForRelease(releasePubkey).map(
        (e) => e.publicKey.toBase58()
      )
      const idsToRemove = releaseExchangeIds.filter(
        (id) => !exchangeIds.includes(id)
      )

      if (exchangeAccounts.error) {
        throw exchangeAccounts.error
      } else {
        saveExchangesToState(existingExchanges, idsToRemove)
      }
    }
  }

  const getExchangesForUser = async () => {
    if (!wallet?.connected) {
      return
    }
    getExchangesHandler(lookupTypes.USER)
  }

  const getExchangesForRelease = async (releasePubkey) => {
    getExchangesHandler(lookupTypes.RELEASE, releasePubkey)
  }

  const getExchangeHistoryForRelease = async (releasePubkey) => {
    const nina = await NinaClient.connect(provider)
    let exchangeHistoryAccounts = await getProgramAccounts(
      nina.program,
      'ExchangeHistory',
      { release: releasePubkey },
      connection
    )

    exchangeHistoryAccounts = exchangeHistoryAccounts.map((e) => {
      e.dateFormatted = NinaClient.dateConverter(e.datetime)
      return e
    })

    if (exchangeHistoryAccounts.error) {
      throw exchangeHistoryAccounts.error
    } else {
      saveExchangeHistoryToState(exchangeHistoryAccounts)
    }
  }

  const getExchangeHistoryForUser = async () => {
    if (!wallet?.connected) {
      return
    }
    const nina = await NinaClient.connect(provider)
    const exchangeHistoryAccountsBuy = await getProgramAccounts(
      nina.program,
      'ExchangeHistory',
      { buyer: wallet?.publicKey.toBase58() },
      connection
    )

    const exchangeHistoryAccountsSell = await getProgramAccounts(
      nina.program,
      'ExchangeHistory',
      { seller: wallet?.publicKey.toBase58() },
      connection
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
      if (exchange.release.toBase58() === releasePubkey) {
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
      if (!wallet?.connected) {
        return []
      }

      exchanges = exchanges.filter(
        (e) => e.initializer.toBase58() === wallet?.publicKey.toBase58()
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
    if (!wallet?.connected) {
      return
    }

    const exchangeHistory = []
    Object.keys(exchangeHistoryState).forEach((pubkey) => {
      const history = exchangeHistoryState[pubkey]
      if (
        history.seller.toBase58() === wallet?.publicKey.toBase58() ||
        history.buyer.toBase58() === wallet?.publicKey.toBase58()
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
          exchange.initializer.toBase58() === wallet?.publicKey?.toBase58(),
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
export default ExchangeContextProvider
