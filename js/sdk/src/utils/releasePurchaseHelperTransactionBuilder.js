import * as anchor from '@project-serum/anchor'
import { findOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from './web3'

import { decodeNonEncryptedByteArray } from './encrypt'

const releasePurchaseHelperTransactionBuilder = async (
  releasePubkey,
  provider,
  ninaClient,
  hubPubkey = null
) => {
  let hub
  releasePubkey = new anchor.web3.PublicKey(releasePubkey)
  const program = await ninaClient.useProgram()
  const release = await program.account.release.fetch(releasePubkey)

  let [payerTokenAccount] = await findOrCreateAssociatedTokenAccount(
    provider.connection,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    anchor.web3.SystemProgram.programId,
    anchor.web3.SYSVAR_RENT_PUBKEY,
    release.paymentMint
  )

  let [receiverReleaseTokenAccount, receiverReleaseTokenAccountIx] =
    await findOrCreateAssociatedTokenAccount(
      provider.connection,
      new anchor.web3.PublicKey(
        process.env.SOLANA_CLUSTER === 'devnet'
          ? '3kXaMac6r3vr2hsm9WMuNZo9gn4kTakJXWi67MQYfqDm'
          : '5QppUbcftw7x3sX5QYQHbzs3MRXSpWC85dokL7p88fRC'
      ),
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      release.releaseMint
    )

  const request = {
    accounts: {
      release: releasePubkey,
      releaseSigner: release.releaseSigner,
      payer: provider.wallet.publicKey,
      payerTokenAccount,
      receiver: provider.wallet.publicKey,
      receiverReleaseTokenAccount,
      royaltyTokenAccount: release.royaltyTokenAccount,
      releaseMint: release.releaseMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    instructions: [],
  }

  if (hubPubkey) {
    hubPubkey = new anchor.web3.PublicKey(hubPubkey)
    hub = await program.account.hub.fetch(hubPubkey)
    const [hubRelease] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-release')),
        hubPubkey.toBuffer(),
        releasePubkey.toBuffer(),
      ],
      program.programId
    )
    const [hubContent] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-content')),
        hubPubkey.toBuffer(),
        releasePubkey.toBuffer(),
      ],
      program.programId
    )

    const [hubSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode('nina-hub-signer')),
        hubPubkey.toBuffer(),
      ],
      program.programId
    )

    let [hubWallet] = await findOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.publicKey,
      hubSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      release.paymentMint
    )

    request.accounts.hub = hubPubkey
    request.accounts.hubRelease = hubRelease
    request.accounts.hubContent = hubContent
    request.accounts.hubSigner = hubSigner
    request.accounts.hubWallet = hubWallet
  }

  const instructions = []
  if (receiverReleaseTokenAccountIx) {
    instructions.push({
      instructions: [receiverReleaseTokenAccountIx],
      cleanupInstructions: [],
      signers: [],
    })
  }

  if (instructions.length > 0) {
    const formattedInstructions = []
    instructions.forEach((instruction) => {
      formattedInstructions.push(...instruction.instructions)
    })
    request.instructions = formattedInstructions
  }
  // if (ninaClient.isSol(release.paymentMint)) {
  //   const [wrappedSolAccount, wrappedSolInstructions] = await wrapSol(
  //     provider,
  //     release.price,
  //     release.paymentMint
  //   )

  //   if (!request.instructions) {
  //     request.instructions = [...wrappedSolInstructions]
  //   } else {
  //     request.instructions.push(...wrappedSolInstructions)
  //   }
  //   request.accounts.payerTokenAccount = wrappedSolAccount
  // }

  if (hub) {
    const releasePurchaseViaHubIx = await program.methods
      .releasePurchaseViaHub(
        release.price,
        decodeNonEncryptedByteArray(hub.handle)
      )
      .accounts(request.accounts)
      .instruction()
    request.instructions.push(releasePurchaseViaHubIx)

    let latestBlockhash = await provider.connection.getLatestBlockhash(
      'confirmed'
    )

    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: request.instructions,
    }).compileToV0Message()
    const tx = new anchor.web3.VersionedTransaction(messageV0)
    return tx
  } else {
    const releasePurchaseIx = await program.methods
      .releasePurchase(release.price)
      .accounts(request.accounts)
      .instruction()
    request.instructions.push(releasePurchaseIx)

    let latestBlockhash = await provider.connection.getLatestBlockhash(
      'confirmed'
    )

    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: request.instructions,
    }).compileToV0Message()
    const tx = new anchor.web3.VersionedTransaction(messageV0)
    return tx
  }
}

export default releasePurchaseHelperTransactionBuilder
