import { createContext, useContext, useState } from 'react'
import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import NinaClient from '../utils/client'
import { ninaErrorHandler } from '../utils/errors'
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
} from '../utils/web3'

export const HubContext = createContext()
const HubContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { connection } = useContext(ConnectionContext)
  const [hubState, setHubState] = useState({})

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
  } = hubContextHelper({
    connection,
    wallet,
    hubState,
    setHubState,
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
        releaseInitViaHub,
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

      return {
        success: true,
        msg: 'Hub Created',
      }
      
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const hubAddArtist = async (artistPubkey, hubPubkey) => {
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
      await nina.rpc.hubAddArtist({
        accounts: {
          curator: provider.wallet.publicKey,
          hub: hubPubkey,
          hubArtist,
          artist: artistPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }
      })
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

  const releaseInitViaHub = async (
    hubPubkey, 
    artistPubkey,
    retailPrice,
    amount,
    resalePercentage,
    isUsdc = true,
  ) => {
    try {
      const nina = await NinaClient.connect(provider)
      const hubAccount = await nina.account.hub.fetch(hubPubkey)

      const releaseMint = anchor.web3.Keypair.generate()
      const paymentMint = new anchor.web3.PublicKey(
        isUsdc ? NinaClient.ids().mints.usdc : NinaClient.ids().mints.wsol
      )
      const publishingCreditMint = new anchor.web3.PublicKey(
        NinaClient.ids().mints.publishingCredit
      )
      const [release, releaseBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode('nina-release')),
            releaseMint.publicKey.toBuffer(),
          ],
          nina.program.programId
        )

      const [releaseSigner, releaseSignerBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [release.toBuffer()],
          nina.program.programId
        )
      const releaseMintIx = await createMintInstructions(
        provider,
        provider.wallet.publicKey,
        releaseMint.publicKey,
        0
      )

      const [authorityTokenAccount, authorityTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          provider.wallet.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint
        )

      const [royaltyTokenAccount, royaltyTokenAccountIx] =
        await findOrCreateAssociatedTokenAccount(
          provider.connection,
          provider.wallet.publicKey,
          releaseSigner,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          paymentMint,
          true
        )

      const [hubArtist, bump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-artist")), 
          hubPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        nina.programId
      );

      const [hubRelease, hubReleaseBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
          hubPubkey.toBuffer(),
          release.toBuffer(),
        ],
        nina.programId
      );
      let instructions = [...releaseMintIx, royaltyTokenAccountIx]

      if (authorityTokenAccountIx) {
        instructions.push(authorityTokenAccountIx)
      }

      const config = {
        amountTotalSupply: new anchor.BN(amount),
        amountToArtistTokenAccount: new anchor.BN(0),
        amountToVaultTokenAccount: new anchor.BN(0),
        resalePercentage: new anchor.BN(resalePercentage * 10000),
        price: new anchor.BN(NinaClient.uiToNative(retailPrice, paymentMint)),
        releaseDatetime: new anchor.BN(Date.now() / 1000),
      }

      const bumps = {
        release: releaseBump,
        signer: releaseSignerBump,
      }

      const txid = await nina.program.rpc.releaseInitWithCredit(config, bumps, {
        accounts: {
          release,
          releaseSigner,
          hub,
          hubArtist,
          hubRelease,
          hubCurator: hubAccount.curator,
          hubCuratorUsdcTokenAccount: hubAccount.usdcTokenAccount,
          releaseMint: releaseMint.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: authorityTokenAccount,
          authorityPublishingCreditTokenAccount,
          publishingCreditMint,
          paymentMint,
          royaltyTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: NinaClient.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint],
        instructions,
      })
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getHub = async (hubPubkey) => {
    try {
      const updatedState = {...hubState}
      const nina = await NinaClient.connect(provider)
      const hub = await nina.account.hub.fetch(new anchor.web3.publicKey(hubPubkey))
      updatedState[hubPubkey] = hub
      setHubState(updatedState)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  const getAllHubs = async () => {
    try {
      const updatedState = {...hubState}
      const nina = await NinaClient.connect(provider)
      console.log('nina.account.hub.fetch. :>> ', nina.program.account.hub.fetch);
      const hubs = await nina.program.account.hub.fetch.all()

      hubs.forEach(hub => {
        const publicKey = hub.publicKey.toBase58()
        updatedState[publicKey] = {
          ...hub.account,
          publicKey
        }
      })
      setHubState(updatedState)
    } catch (error) {
      return ninaErrorHandler(error)
    }
  }

  return {
    getAllHubs,
    getHub,
    hubInit,
    hubAddArtist,
    hubAddRelease,
    hubRemoveArtist,
    hubRemoveRelease,
    releaseInitViaHub,
  }
}
export default HubContextProvider
