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
const USDC_MINT = new anchor.web3.PublicKey(NinaClient.ids().mints.usdc)
const WRAPPED_SOL_MINT = new anchor.web3.PublicKey(NinaClient.ids().mints.wsol)

export const HubContext = createContext()
const HubContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { connection } = useContext(ConnectionContext)
  const [hubState, setHubState] = useState({})
  const [hubArtistsState, setHubArtistsState] = useState({})
  const [hubReleasesState, setHubReleasesState] = useState({})

  const {
    getAllHubs,
    getHub,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    filterHubsByCurator, 
    getHubArtists,
    getHubReleases,
    filterHubArtistsByHub,
    filterHubReleasesByHub,
  } = hubContextHelper({
    connection,
    wallet,
    hubState,
    setHubState,
    hubArtistsState,
    setHubArtistsState,
    hubReleasesState,
    setHubReleasesState,
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
        filterHubsByCurator,
        filterHubArtistsByHub,
        filterHubReleasesByHub,    
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
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const hubInit = async (hubParams) => {
    console.log('~Hub Init~');
    hubParams.publish_fee = new anchor.BN(hubParams.publish_fee)
    hubParams.referral_fee = new anchor.BN(hubParams.referral_fee)
    try {
      const nina = await NinaClient.connect(provider)

      const [hub] = await anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub")), 
        Buffer.from(anchor.utils.bytes.utf8.encode(hubParams.name))],
        nina.program.programId
      );

      const [hubSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
        nina.program.programId
      );

      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress([
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hub.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.program.programId
      );

      let [usdcVault, usdcVaultIx] =
        await findOrCreateAssociatedTokenAccount(
          connection,
          provider.wallet.publicKey,
          hubSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          USDC_MINT
        )

        let [wrappedSolVault, wrappedSolVaultIx] =
        await findOrCreateAssociatedTokenAccount(
          connection,
          provider.wallet.publicKey,
          hubSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          WRAPPED_SOL_MINT
        )

        //add IX for create

      const txid = await nina.program.rpc.hubInit(
        hubParams, {
          accounts: {
            curator: provider.wallet.publicKey,
            hub,
            hubSigner,
            hubArtist,
            usdcMint: USDC_MINT,
            wrappedSolMint: WRAPPED_SOL_MINT,
            usdcVault,
            wrappedSolVault,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          instructions: [
            usdcVaultIx,
            wrappedSolVaultIx
          ]
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

  const hubAddArtist = async (artistPubkey, hubPubkey, canAddReleases) => {

    artistPubkey = new anchor.web3.PublicKey(artistPubkey)
    hubPubkey = new anchor.web3.PublicKey(hubPubkey)

    try {
      const nina = await NinaClient.connect(provider)
      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hubPubkey.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.program.programId
      );

      const txid = await nina.program.rpc.hubAddArtist(canAddReleases, {
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
    hubPubkey = new anchor.web3.PublicKey(hubPubkey)

    try {
      const nina = await NinaClient.connect(provider)
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      );
      
      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.programId
      );


      await nina.rpc.hubAddRelease({
        accounts: {
          payer: provider.wallet.publicKey,
          hub: hubPubkey,
          hubRelease: hubArtist,
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
      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hub.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.programId
      );

      await nina.rpc.hubRemoveArtist({
        accounts: {
          payer: provider.wallet.publicKey,
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
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
          hub.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      );

      await nina.rpc.hubRemoveRelease({
        accounts: {
          payer: provider.wallet.publicKey,
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
    if (!hubPubkey) {
      return
    }
    try {
      const nina = await NinaClient.connect(provider)
      const hubArtists = await nina.program.account.hubArtist.all()
      const hubArtistsForHub = []
      for await (let hubArtist of hubArtists) {
        if (hubArtist.account.hub.toBase58() === hubPubkey) {
          hubArtistsForHub.push(hubArtist)
          console.log(hubArtist.publicKey.toBase58())
        }
      }
      saveHubArtistsToState(hubArtistsForHub)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHubReleases = async (hubPubkey) => {
    if (!hubPubkey) {
      return
    }
    try {
      const nina = await NinaClient.connect(provider)
      const hubReleases = await nina.program.account.hubRelease.all()
      const hubReleasesForHub = []
      for await (let hubRelease of hubReleases) {
        if (hubRelease.account.hub.toBase58() === hubPubkey) {
          hubReleasesForHub.push(hubReleases)
        }
      }
      saveHubReleasesToState(hubReleasesForHub)
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

  const saveHubArtistsToState = async (hubArtists) => {
    try {
      let updatedState = {...hubArtistsState}
      console.log("saveHubArtistsToState: ", hubArtists)
      for (let hubArtist of hubArtists) {
        updatedState = {
            ...updatedState,
            [hubArtist.publicKey.toBase58()]: {
              hub: hubArtist.account.hub.toBase58(),
              artist: hubArtist.account.artist.toBase58(),
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

  const saveHubReleasesToState = async (hubReleases) => {
    try {
      let updatedState = {...hubReleasesState}

      for (let hubRelease of hubReleases) {
          updatedState = {
            ...updatedState,
            [hubRelease.publicKey.toBase58()]: {
              hub: hubRelease.account.hub.toBase58(),
              release: hubRelease.account.release.toBase58(),
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

  const filterHubArtistsByHub = (hubPubkey) => {
    const hubArtists = []
    Object.keys(hubArtistsState).forEach(hubArtistPubkey => {
      const hubArtist = hubArtistsState[hubArtistPubkey]
      if (hubArtist.hub === hubPubkey) {
        hubArtists.push(hubArtist)
      }
    })
    return hubArtists
  }

  const filterHubReleasesByHub = (hubPubkey) => {
    const hubReleases = []
    Object.keys(hubReleasesState).forEach(hubReleasePubkey => {
      const hubRelease = hubReleasesState[hubReleasePubkey]
      if (hubRelease.hub === hubPubkey) {
        hubReleases.push(hubRelease)
      }
    })
    return hubReleases
  }


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
    filterHubArtistsByHub,
    filterHubReleasesByHub,
    getHubArtists,
    getHubReleases
  }
}
export default HubContextProvider
