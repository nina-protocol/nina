import { createContext, useContext, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import NinaClient from '../utils/client'
import { ninaErrorHandler } from '../utils/errors'
import { findOrCreateAssociatedTokenAccount } from '../utils/web3'
import { decodeNonEncryptedByteArray } from '../utils/encrypt'
const USDC_MINT = new anchor.web3.PublicKey(NinaClient.ids().mints.usdc)
const WRAPPED_SOL_MINT = new anchor.web3.PublicKey(NinaClient.ids().mints.wsol)

export const HubContext = createContext()
const HubContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { connection } = useContext(ConnectionContext)
  const [hubState, setHubState] = useState({})
  const [hubArtistsState, setHubArtistsState] = useState({})
  const [hubReleasesState, setHubReleasesState] = useState({})
  const [allHubs, setAllHubs] = useState([])
  const [count, setCount] = useState(undefined)

  const {
    getAllHubs,
    getHub,
    getHubsForArtist,
    getHubsForRelease,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    hubWithdraw,
    filterHubsByCurator,
    filterHubArtistsByHub,
    filterHubReleasesByHub,
    filterHubsByArtist,
    filterHubsByRelease,
  } = hubContextHelper({
    connection,
    wallet,
    hubState,
    setHubState,
    hubArtistsState,
    setHubArtistsState,
    hubReleasesState,
    setHubReleasesState,
    allHubs,
    setAllHubs,
    count,
    setCount,
  })

  return (
    <HubContext.Provider
      value={{
        getAllHubs,
        getHub,
        getHubsForArtist,
        getHubsForRelease,
        hubInit,
        hubAddArtist,
        hubAddRelease,
        hubRemoveArtist,
        hubRemoveRelease,
        hubWithdraw,
        hubState,
        hubArtistsState,
        hubReleasesState,
        filterHubsByCurator,
        filterHubArtistsByHub,
        filterHubReleasesByHub,
        filterHubsByArtist,
        filterHubsByRelease,
        count
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
  allHubs,
  setAllHubs,
  count,
  setCount,
}) => {
  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  )

  const hubInit = async (hubParams) => {
    try {
      const nina = await NinaClient.connect(provider)
      hubParams.publish_fee = new anchor.BN(hubParams.publishFee)
      hubParams.referral_fee = new anchor.BN(hubParams.referralFee)

      const [hub] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub')),
          Buffer.from(anchor.utils.bytes.utf8.encode(hubParams.name)),
        ],
        nina.program.programId
      )

      const [hubSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-signer')),
          hub.toBuffer(),
        ],
        nina.program.programId
      )

      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-artist')),
          hub.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.program.programId
      )

      let [usdcVault, usdcVaultIx] = await findOrCreateAssociatedTokenAccount(
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

      const txid = await nina.program.rpc.hubInit(hubParams, {
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
        instructions: [usdcVaultIx, wrappedSolVaultIx],
      })

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

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
    try {
      const nina = await NinaClient.connect(provider)
      artistPubkey = new anchor.web3.PublicKey(artistPubkey)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-artist')),
          hubPubkey.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.program.programId
      )

      const txid = await nina.program.rpc.hubAddArtist(canAddReleases, {
        accounts: {
          curator: provider.wallet.publicKey,
          hub: hubPubkey,
          hubArtist,
          artist: artistPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      })

      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      await getHub(hubPubkey.toBase58())

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
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      )

      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-artist')),
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.programId
      )

      const txid = await nina.rpc.hubAddRelease({
        accounts: {
          payer: provider.wallet.publicKey,
          hub: hubPubkey,
          hubRelease,
          hubArtist,
          release: releasePubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      await getHub(hubPubkey.toBase58())
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubRemoveArtist = async (hubPubkey, artistPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      artistPubkey = new anchor.web3.PublicKey(artistPubkey)
      const [hubArtist] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-artist')),
          hubPubkey.toBuffer(),
          artistPubkey.toBuffer(),
        ],
        nina.programId
      )

      const txid = await nina.rpc.hubRemoveArtist({
        accounts: {
          payer: provider.wallet.publicKey,
          hub: hubPubkey,
          hubArtist,
          artist: artistPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      await getHub(hubPubkey.toBase58())
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubRemoveRelease = async (hubPubkey, releasePubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)
      releasePubkey = new anchor.web3.PublicKey(releasePubkey)
      const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
          hubPubkey.toBuffer(),
          releasePubkey.toBuffer(),
        ],
        nina.programId
      )

      const txid = await nina.rpc.hubRemoveRelease({
        accounts: {
          payer: provider.wallet.publicKey,
          hub: hubPubkey,
          hubRelease,
          release: releasePubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')

      await getHub(hubPubkey.toBase58())
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubWithdraw = async (hubPubkey) => {
    try {
      const nina = await NinaClient.connect(provider)
      hubPubkey = new anchor.web3.PublicKey(hubPubkey)

      const [hubSigner, hubSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
        nina.programId
      );

      let [withdrawTarget] = await findOrCreateAssociatedTokenAccount(
        provider,
        hubSigner,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        USDC_MINT,
      );

      let [withdrawDestination] = await findOrCreateAssociatedTokenAccount(
        provider,
        provider.wallet.publicKey,
        anchor.web3.SystemProgram.programId,
        anchor.web3.SYSVAR_RENT_PUBKEY,
        USDC_MINT,
      );

      await nina.rpc.hubWithdraw(
        new anchor.BN(withdrawAmount),
        hubSignerBump, {
          accounts: {
            curator: provider.wallet.publicKey,
            hub,
            hubSigner,
            withdrawTarget,
            withdrawDestination,
            withdrawMint: USDC_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
          }
        }
      );
    } catch (error) {
      console.warn(error)
    }
  }

  const getHub = async (hubPubkey) => {
    await getHubs([hubPubkey])
  }

  const getHubs = async (hubPubkeys) => {
    try {
      const nina = await NinaClient.connect(provider)
      let hubArtists = []
      let hubReleases = []
      let hubs = []
      for await (let hubPubkey of hubPubkeys) {
        const hub = await nina.program.account.hubV1.fetch(
          new anchor.web3.PublicKey(hubPubkey)
        )
        hubs.push({
          publicKey: new anchor.web3.PublicKey(hubPubkey),
          ...hub,
        })
        const hubResult = await fetch(
          `${NinaClient.endpoints.api}/hubs/${hubPubkey}`,
        )
        const hubJSON = await hubResult.json()
  
        let hubArtistAccounts = await anchor.utils.rpc.getMultipleAccounts(
          connection,
          hubJSON.hubArtists.map((r) => new anchor.web3.PublicKey(r))
        )
        hubArtists.push(...hubArtistAccounts)
        let hubReleasesAccounts = await anchor.utils.rpc.getMultipleAccounts(
          connection,
          hubJSON.hubReleases.map((r) => new anchor.web3.PublicKey(r))
        )
        hubReleases.push(hubReleasesAccounts)
      }

      saveHubsToState(hubs)
      saveHubArtistsToState(hubArtists.filter((item) => item != null))
      saveHubReleasesToState(hubReleases.filter((item) => item != null))
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHubsForArtist = async (publicKey) => {
    try {
      const hubsResult = await fetch(
        `${NinaClient.endpoints.api}/hubs/artist/${publicKey}`,
      )
      const hubsJSON = await hubsResult.json()
      await getHubs(hubsJSON.hubs)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHubsForRelease = async (publicKey) => {
    try {
      const hubsResult = await fetch(
        `${NinaClient.endpoints.api}/hubs/release/${publicKey}`,
      )
      const hubsJSON = await hubsResult.json()
      await getHubs(hubsJSON.hubs)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getAllHubs = async () => {
    try {
      const nina = await NinaClient.connect(provider)
      const all = [...allHubs]
      const hubResult = await fetch(
        `${NinaClient.endpoints.api}/hubs?offset=${allHubs.length}`,
      )
      const json = await hubResult.json()
      json.hubs.forEach((id) => {
        if (!allHubs.includes(id)) {
          all.push(id)
        }
      })
      setCount(json.count)
      setAllHubs(all)
      const hubs = []
      let hubAccounts = await anchor.utils.rpc.getMultipleAccounts(
        connection,
        all.map(id => new anchor.web3.PublicKey(id))
      )
      hubAccounts = hubAccounts.filter((item) => item != null)
      const layout = nina.program.coder.accounts.accountLayouts.get('HubV1')
      hubAccounts.forEach(hub => {
        let dataParsed = layout.decode(hub.account.data.slice(8))
        dataParsed.publicKey = hub.publicKey
        hubs.push(dataParsed)
      })
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
      let updatedState = { ...hubState }

      for await (let hub of hubs) {
        const publicKey = hub.publicKey.toBase58()
        updatedState[publicKey] = {
          curator: hub.curator.toBase58(),
          publishFee: hub.publishFee.toNumber(),
          referralFee: hub.referralFee.toNumber(),
          hubSigner: hub.hubSigner.toBase58(),
          name: decodeNonEncryptedByteArray(hub.name),
          uri: decodeNonEncryptedByteArray(hub.uri),
        }
      }
      setHubState(updatedState)
    } catch (error) {
      console.warn(error)
    }
  }

  const saveHubArtistsToState = async (hubArtists) => {
    try {
      const nina = await NinaClient.connect(provider)
      let updatedState = { ...hubArtistsState }
      for (let hubArtist of hubArtists) {
        const layout =
          nina.program.coder.accounts.accountLayouts.get('HubArtistV1')
        let dataParsed = layout.decode(hubArtist.account.data.slice(8))
        updatedState = {
          ...updatedState,
          [hubArtist.publicKey.toBase58()]: {
            hub: dataParsed.hub.toBase58(),
            artist: dataParsed.artist.toBase58(),
            publicKey: hubArtist.publicKey.toBase58(),
          },
        }
      }
      setHubArtistsState(updatedState)
    } catch (error) {
      console.warn(error)
    }
  }

  const saveHubReleasesToState = async (hubReleases) => {
    try {
      const nina = await NinaClient.connect(provider)
      let updatedState = { ...hubReleasesState }
      for (let hubRelease of hubReleases) {
        const layout =
          nina.program.coder.accounts.accountLayouts.get('HubReleaseV1')
        let dataParsed = layout.decode(hubRelease.account.data.slice(8))

        updatedState = {
          ...updatedState,
          [hubRelease.publicKey.toBase58()]: {
            hub: dataParsed.hub.toBase58(),
            release: dataParsed.release.toBase58(),
            publicKey: hubRelease.publicKey.toBase58(),
          },
        }
      }
      setHubReleasesState(updatedState)
    } catch (error) {
      console.warn(error)
    }
  }

  const filterHubArtistsByHub = (hubPubkey) => {
    const hubArtists = []
    Object.keys(hubArtistsState).forEach((hubArtistPubkey) => {
      const hubArtist = hubArtistsState[hubArtistPubkey]
      if (hubArtist.hub === hubPubkey) {
        hubArtists.push(hubArtist)
      }
    })
    return hubArtists
  }

  const filterHubReleasesByHub = (hubPubkey) => {
    const hubReleases = []
    Object.keys(hubReleasesState).forEach((hubReleasePubkey) => {
      const hubRelease = hubReleasesState[hubReleasePubkey]
      if (hubRelease.hub === hubPubkey) {
        hubReleases.push(hubRelease)
      }
    })
    return hubReleases
  }

  const filterHubsByCurator = (userPubkey = undefined) => {
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
    }

    const hubs = []
    Object.keys(hubState).forEach((hubPubkey) => {
      const hubData = hubState[hubPubkey]
      hubData.publicKey = hubPubkey
      if (hubData.curator === userPubkey) {
        hubs.push(hubData)
      }
    })
    return hubs
  }

  const filterHubsByArtist = (userPubkey = undefined) => {
    if (!userPubkey) {
      userPubkey = wallet?.publicKey.toBase58()
    }

    const hubs = []
    Object.keys(hubArtistsState).forEach((hubArtistId) => {
      const hubArtist = hubArtistsState[hubArtistId]
      if (hubArtist.artist === userPubkey) {
        hubs.push(hubState[hubArtist.hub])
      }
    })
    return hubs
  }

  const filterHubsByRelease = (releasePubkey) => {
    const hubs = []
    Object.keys(hubReleasesState).forEach((hubReleaseId) => {
      const hubRelease = hubReleasesState[hubReleaseId]
      if (hubRelease.release === releasePubkey) {
        hubs.push(hubState[hubRelease.hub])
      }
    })
    return hubs
  }

  return {
    getAllHubs,
    getHub,
    getHubsForArtist,
    getHubsForRelease,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    hubWithdraw,
    filterHubsByCurator,
    filterHubsByArtist,
    filterHubsByRelease,
    filterHubArtistsByHub,
    filterHubReleasesByHub,
  }
}
export default HubContextProvider
