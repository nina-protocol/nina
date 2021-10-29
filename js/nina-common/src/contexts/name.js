import React, { createContext, useContext, useState } from 'react'
import {
  createVerifiedTwitterRegistry,
  getHandleAndRegistryKey,
  getTwitterRegistry,
} from '@bonfida/spl-name-service'
import { Connection, Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import NinaClient from '../utils/client'
import { postTwitterRegistrarRequest } from '../utils/web3'
import { ConnectionContext } from './connection'
import { ReleaseContext } from './release'

export const NameContext = createContext()
const NameContextProvider = ({ children }) => {
  const { connection } = useContext(ConnectionContext)

  const wallet = useWallet()
  const {
    getReleasesPublishedByUser,
    emptySearchResults,
    addRoyaltyRecipient,
  } = useContext(ReleaseContext)
  const [userTwitterHandle, setUserTwitterHandle] = useState(null)
  const [twitterHandlePublicKeyMap, setTwitterHandlePublicKeyMap] = useState({})

  const {
    findRegistrationTweet,
    getReleasesForTwitterHandle,
    lookupUserTwitterHandle,
    registerTwitterHandle,
    addRoyaltyRecipientByTwitterHandle,
  } = nameContextHelper({
    wallet,
    connection,
    userTwitterHandle,
    setUserTwitterHandle,
    getReleasesPublishedByUser,
    getTwitterRegistry,
    emptySearchResults,
    addRoyaltyRecipient,
    twitterHandlePublicKeyMap,
    setTwitterHandlePublicKeyMap,
  })

  return (
    <NameContext.Provider
      value={{
        findRegistrationTweet,
        lookupUserTwitterHandle,
        registerTwitterHandle,
        userTwitterHandle,
        getReleasesForTwitterHandle,
        addRoyaltyRecipientByTwitterHandle,
        twitterHandlePublicKeyMap,
      }}
    >
      {children}
    </NameContext.Provider>
  )
}
export default NameContextProvider

const nameContextHelper = ({
  wallet,
  connection,
  setUserTwitterHandle,
  getReleasesPublishedByUser,
  getTwitterRegistry,
  emptySearchResults,
  addRoyaltyRecipient,
  twitterHandlePublicKeyMap,
  setTwitterHandlePublicKeyMap,
}) => {
  // Name Service

  const findRegistrationTweet = async () => {
    const result = await fetch(
      `${
        NinaClient.endpoints.api
      }/api/twitter/verify?publicKey=${wallet.publicKey.toBase58()}`
    )
    return result.json()
  }

  const lookupUserTwitterHandle = async (publicKey = undefined) => {
    const mainnetConnection = new Connection(
      'https://solana-api.projectserum.com',
      'recent'
    )
    if (!publicKey) {
      publicKey = wallet.publicKey
    }

    try {
      const [twitterHandle] = await getHandleAndRegistryKey(
        mainnetConnection,
        publicKey
      )

      if (publicKey === wallet?.publicKey) {
        setUserTwitterHandle(twitterHandle)
      }
      const pubkey = publicKey.toBase58()
      setTwitterHandlePublicKeyMap({
        ...twitterHandlePublicKeyMap,
        [pubkey]: twitterHandle,
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const registerTwitterHandle = async (twitterHandle, twitterLink) => {
    const instruction = await createVerifiedTwitterRegistry(
      connection,
      twitterHandle,
      wallet.publicKey,
      1_000,
      wallet.publicKey
    )
    try {
      const transaction = new Transaction().add(...instruction)
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('finalized')
      ).blockhash
      transaction.feePayer = wallet.publicKey
      await wallet.signTransaction(transaction)
      await postTwitterRegistrarRequest(
        transaction,
        wallet.publicKey,
        twitterLink,
        twitterHandle
      )

      setUserTwitterHandle(twitterHandle)

      return {
        success: true,
        msg: 'Twitter handle registered!',
      }
    } catch (err) {
      return {
        success: false,
        msg: 'Unable to register Twitter Handle',
      }
    }
  }

  const getReleasesForTwitterHandle = async (handle) => {
    try {
      const mainnetConnection = new Connection(
        'https://solana-api.projectserum.com',
        'recent'
      )
      const user = await getTwitterRegistry(mainnetConnection, handle)
      getReleasesPublishedByUser(user.owner.toBase58(), handle)
    } catch (error) {
      console.warn(error)
      emptySearchResults(handle)
    }
  }

  const addRoyaltyRecipientByTwitterHandle = async (
    release,
    updateData,
    releasePubkey
  ) => {
    try {
      const mainnetConnection = new Connection(
        'https://solana-api.projectserum.com',
        'recent'
      )
      const user = await getTwitterRegistry(
        mainnetConnection,
        updateData.recipientAddress
      )
      updateData.recipientAddress = user.owner.toBase58()
      addRoyaltyRecipient(release, updateData, releasePubkey)
    } catch (error) {
      console.warn(error)
    }
  }

  return {
    findRegistrationTweet,
    lookupUserTwitterHandle,
    registerTwitterHandle,
    getReleasesForTwitterHandle,
    addRoyaltyRecipientByTwitterHandle,
  }
}
