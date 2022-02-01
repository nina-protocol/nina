import { createContext, useContext, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import NinaClient from '../utils/client'
import { ninaErrorHandler } from '../utils/errors'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  getProgramAccounts
} from '../utils/web3'
import {
  decodeNonEncryptedByteArray,
} from '../utils/encrypt'

export const HubContext = createContext()
const HubContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { connection } = useContext(ConnectionContext)
  const [hubState, setHubState] = useState({})
  const [hubArtistsState, setHubArtistsState] = useState({})
  const [hubReleasesState, setHubReleasesState] = useState({})

  const usdcMint = NinaClient.ids().mints.usdc
  const USDC_MINT_ID = new anchor.web3.PublicKey(usdcMint)

  const {
    getAllHubs,
    getHub,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    releaseInitViaHub,
    filterHubsByCurator, 
    getHubArtists,
    getHubReleases,
  } = hubContextHelper({
    connection,
    wallet,
    hubState,
    setHubState,
    hubArtistsState,
    setHubArtistsState,
    hubReleasesState,
    setHubReleasesState,
    USDC_MINT_ID
  })

  return (
    <HubContext.Provider
      value={{
        getAllHubs,
        getHub,
        hubInit,
        hubAddArtist,
        hubAddRelease,
        hubRemoveArtist,
        hubRemoveRelease,
        hubState,
        hubArtistsState,
        hubReleasesState,
        releaseInitViaHub,
        filterHubsByCurator,
        getHubArtists,
        getHubReleases
      }}
    >
      {children}
    </HubContext.Provider>
  )
}

const hubContextHelper = ({
  connection,
  wallet,
  hubState,
  setHubState,
  hubArtistsState,
  setHubArtistsState,
  hubReleasesState,
  setHubReleasesState,
  USDC_MINT_ID
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const hubInit = async (hubParams) => {
    console.log('~Hub Init~');
    hubParams.fee = new anchor.BN(hubParams.fee)
    try {
      const nina = await NinaClient.connect(provider)

      const [hub, hubBump] = await anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub")), 
        Buffer.from(anchor.utils.bytes.utf8.encode(hubParams.name))],
        nina.program.programId
      );

      const [hubSigner, hubSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
        nina.program.programId
      );

      const [hubArtist, bump] = await anchor.web3.PublicKey.findProgramAddress([
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hub.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.program.programId
      );

      let [curatorUsdcTokenAccount, _curatorUsdcTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          USDC_MINT_ID
        )

        //add IX for create

      const txid = await nina.program.rpc.hubInit(
        hubParams, {
          accounts: {
            hub,
            curator: provider.wallet.publicKey,
            hubSigner,
            hubArtist,
            usdcMint: USDC_MINT_ID,
            usdcTokenAccount: curatorUsdcTokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          }
        }
      )

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed');

      await getHub(hub.toBase58())

      return {
        success: true,
        msg: 'Hub Created',
      }
      
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubAddArtist = async (artistPubkey, hubPubkey) => {

    artistPubkey = new anchor.web3.PublicKey(artistPubkey)
    hubPubkey = new anchor.web3.PublicKey(hubPubkey)

    try {
      const nina = await NinaClient.connect(provider)

      const [hubArtist, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hubPubkey.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.program.programId
      );

      const txid = await nina.program.rpc.hubAddArtist({
        accounts: {
          curator: provider.wallet.publicKey,
          hub: hubPubkey,
          hubArtist,
          artist: artistPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }
      })

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed');

      await getHubArtists(hubPubkey)

      return {
        success: true,
        msg: 'Artist Added to hub',
      }


    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubAddRelease = async (hubPubkey, releasePubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      );

      await nina.rpc.hubAddRelease({
        accounts: {
          curator: provider.wallet.publicKey,
          hub: hubPubkey,
          hubRelease,
          release: releasePubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }
      })
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubRemoveArtist = async (artistPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      const [hubArtist, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hub.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.programId
      );

      await nina.rpc.hubRemoveArtist({
        accounts: {
          curator: provider.wallet.publicKey,
          hub,
          hubArtist,
          artist: artistPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      })
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubRemoveRelease = async (releasePubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
          hub.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      );

      await nina.rpc.hubRemoveRelease({
        accounts: {
          curator: provider.wallet.publicKey,
          hub,
          hubRelease,
          release: releasePubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      })
      
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHub = async (hubPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      const hub = await nina.program.account.hub.fetch(new anchor.web3.PublicKey(hubPubkey))
      const formattedHub = {publicKey: new anchor.web3.PublicKey(hubPubkey), account: hub}
      saveHubsToState([formattedHub])
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHubArtists = async (hubPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      let hubArtists = await getProgramAccounts(
        nina.program,
        'HubArtist',
        {hub: hubPubkey},
        connection
      )

      saveHubArtistsToState(hubPubkey, hubArtists)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHubReleases = async (hubPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      let hubReleases = await getProgramAccounts(
        nina.program,
        'HubRelease',
        {hub: hubPubkey},
        connection
      )
      saveHubReleasesToState(hubPubkey, hubReleases)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getAllHubs = async () => {
    try {
      const nina = await NinaClient.connect(provider)     
      const hubs = await nina.program.account.hub.all()
      await saveHubsToState(hubs)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }


  /*

  STATE FILTERS

  */

  const saveHubsToState = async (hubs) => {
    try {
      let updatedState = {...hubState}
      

      for await (let hub of hubs) {
        const publicKey = hub.publicKey.toBase58()
          updatedState[publicKey] = {
              curator: hub.account.curator,
              fee: hub.account.fee,
              hubSigner: hub.account.hubSigner,
              name: decodeNonEncryptedByteArray(hub.account.name),
              uri: decodeNonEncryptedByteArray(hub.account.uri),
              usdcTokenAccount: hub.account.usdcTokenAccount,
          }
        }
         setHubState(updatedState)
      }

     catch (error) {
      console.warn(error)
    }
  }

  const saveHubArtistsToState = async (hubPubkey, hubArtists) => {
    try {
      let updatedState = {...hubArtistsState}

      for await (let hubArtist of hubArtists) {
        const hubAristPublicKey = hubArtist.publicKey.toBase58()
          updatedState[hubPubkey] = {
            ...updatedState[hubPubkey],
            [hubAristPublicKey]: {
             artist: hubArtist.artist
           }
          }
        }
        console.log('updatedState artists :>> ', updatedState);
        setHubArtistsState(updatedState)
      }

     catch (error) {
      console.warn(error)
    }
  }

  const saveHubReleasesToState = async (hubPubkey, hubReleases) => {
    try {
      let updatedState = {...hubReleasesState}

      for await (let hubRelease of hubReleases) {
        const hubReleasePublicKey = hubRelease.publicKey.toBase58()
          updatedState[hubPubkey] = {
            ...updatedState[hubPubkey],
            [hubReleasePublicKey]: {
             release: hubRelease.release
           }
          }
        }
        console.log('updatedState Releases :>> ', updatedState);
        setHubReleasesState(updatedState)
      }

     catch (error) {
      console.warn(error)
    }
  }

  // const saveHubReleasesToState = async (hubPubkey, hubReleases) => {
  //   try {
  //     let updatedState = {...hubState}

  //     if (!updatedState[hubPubkey]?.hubReleases) {
  //       updatedState[hubPubkey].hubReleases = {}
  //     }

  //     for await (let hubRelease of hubReleases) {
  //       // console.log('hubRelease.hub.toBase58() :>> ', hubRelease.hub.toBase58());
  //       // console.log('hubRelease.release.toBase58() :>> ', hubRelease.release.toBase58());
  //       // console.log('hubRelease.publicKey.toBase58() :>> ', hubRelease.hub.toBase58());
  //       const hubReleasePublicKey = hubRelease.publicKey.toBase58()
  //         updatedState[hubPubkey] = {
  //           ...updatedState[hubPubkey],
  //           hubReleases: {
  //             ...updatedState[hubPubkey].hubReleases,
  //             [hubReleasePublicKey]: {
  //              release: hubRelease.release
  //            }
  //           }
  //         }
  //       }
  //       setHubState(updatedState)
  //     }

  //    catch (error) {
  //     console.warn(error)
  //   }
  // }

  const filterHubsByCurator = (userPubkey = undefined) => {
    // if (!wallet?.connected || (!userPubkey && !wallet?.publicKey)) {
    //   return
    // }
    // Return results for passed in user if another user isn't specified
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
    }
    
    const hubs = []
    Object.keys(hubState).forEach((hubPubkey) => {
      const hubData = hubState[hubPubkey]
      hubData.publicKey = hubPubkey
      console.log('hubData :>> ', hubData);
      if (hubData.curator.toBase58() === userPubkey) {
        hubs.push(hubData)
      }
    })
    return hubs
  }

  return {
    getAllHubs,
    getHub,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    filterHubsByCurator,
    getHubArtists,
    getHubReleases
  }
}
export default HubContextProvider
