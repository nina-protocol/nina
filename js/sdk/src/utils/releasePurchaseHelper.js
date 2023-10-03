import * as anchor from '@coral-xyz/anchor'
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
  swapQuoteByInputToken,
  AccountFetcher,
  swapQuoteByOutputToken,
} from '@orca-so/whirlpools-sdk'
import { Percentage } from '@orca-so/common-sdk'
import axios from 'axios'
import { findOrCreateAssociatedTokenAccount, wrapSol } from './web3'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { decodeNonEncryptedByteArray } from './encrypt'
import { encodeBase64 } from 'tweetnacl-util'

const PRIORITY_SWAP_FEE = 7500
const WHIRLPOOL_PROGRAM_ID = new anchor.web3.PublicKey(
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
)
const SOL_USDC_WHIRLPOOL = new anchor.web3.PublicKey(
  'HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ'
)

const requiresSwap = (release, price, usdcBalance, ninaClient) => {
  return (
    !ninaClient.isSol(release.paymentMint) &&
    usdcBalance <
      ninaClient.nativeToUi(price.toNumber(), ninaClient.ids.mints.usdc)
  )
}

const releasePurchaseWithOrcaSwap = async (
  release,
  price,
  provider,
  ninaClient,
  instructions,
  request,
  hub
) => {
  const context = WhirlpoolContext.from(
    provider.connection,
    provider.wallet,
    WHIRLPOOL_PROGRAM_ID
  )
  const fetcher = new AccountFetcher(context.provider.connection)

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)
  const whirlpoolData = await whirlpool.getData()

  const outputTokenQuote = await swapQuoteByOutputToken(
    whirlpool,
    whirlpoolData.tokenMintB,
    new anchor.BN(price.toNumber() + price.toNumber() * 0.005),
    Percentage.fromFraction(1, 1000),
    context.program.programId,
    fetcher,
    true
  )

  const inputTokenQuote = await swapQuoteByInputToken(
    whirlpool,
    whirlpoolData.tokenMintA,
    outputTokenQuote.estimatedAmountIn,
    Percentage.fromFraction(1, 1000),
    context.program.programId,
    fetcher,
    true
  )

  const txBuilder = await whirlpool.swap(inputTokenQuote)

  const addPriorityFeeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice(
    {
      microLamports: PRIORITY_SWAP_FEE,
    }
  )
  txBuilder.prependInstruction({
    instructions: [addPriorityFeeIx],
    cleanupInstructions: [],
    signers: [],
  })
  if (instructions) {
    txBuilder.addInstructions(instructions)
  }
  const program = await ninaClient.useProgram()
  let purchaseIx
  if (hub) {
    purchaseIx = await program.instruction.releasePurchaseViaHub(
      release.price,
      decodeNonEncryptedByteArray(hub.handle),
      request
    )
  } else {
    purchaseIx = await program.instruction.releasePurchase(
      release.price,
      request
    )
  }

  txBuilder.addInstruction({
    instructions: [purchaseIx],
    cleanupInstructions: [],
    signers: [],
  })

  const tx = await txBuilder.build()
  for await (let signer of tx.signers) {
    tx.transaction.partialSign(signer)
  }
  return await provider.wallet.sendTransaction(
    tx.transaction,
    provider.connection
  )
}

const releasePurchaseHelper = async (
  releasePubkey,
  provider,
  ninaClient,
  usdcBalance,
  solBalance,
  hubPubkey = null
) => {
  let hub
  releasePubkey = new anchor.web3.PublicKey(releasePubkey)
  const program = await ninaClient.useProgram()
  const release = await program.account.release.fetch(releasePubkey)

  //if sol === 0
  console.log('solBalance :>> ', solBalance)
  if (release.price.toNumber() === 0 && solBalance === 0) {
    const message = new TextEncoder().encode(releasePubkey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await provider.wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)
    const response = await axios.get(
      `${
        process.env.NINA_IDENTITY_ENDPOINT
      }/collect/${releasePubkey.toBase58()}?message=${encodeURIComponent(
        messageBase64
      )}&signature=${encodeURIComponent(
        signatureBase64
      )}&publicKey=${encodeURIComponent(provider.wallet.publicKey.toBase58())}`
    )

    return response.data.txid
  }

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
      provider.wallet.publicKey,
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

  let price = release.price
  if (hub && hub.referralFee.toNumber() > 0) {
    let releasePriceUi = ninaClient.nativeToUi(
      release.price.toNumber(),
      release.paymentMint
    )

    let convertAmount =
      releasePriceUi + (releasePriceUi * hub.referralFee.toNumber()) / 1000000
    price = new anchor.BN(
      ninaClient.uiToNative(convertAmount, release.paymentMint)
    )
  }
  const isUsdc = ninaClient.isUsdc(release.paymentMint)
  if (isUsdc && requiresSwap(release, price, usdcBalance, ninaClient)) {
    return releasePurchaseWithOrcaSwap(
      release,
      price,
      provider,
      ninaClient,
      instructions,
      request,
      hub
    )
  } else {
    if (instructions.length > 0) {
      const formattedInstructions = []
      instructions.forEach((instruction) => {
        formattedInstructions.push(...instruction.instructions)
      })
      request.instructions = formattedInstructions
    }
    if (ninaClient.isSol(release.paymentMint)) {
      const [wrappedSolAccount, wrappedSolInstructions] = await wrapSol(
        provider,
        release.price,
        release.paymentMint
      )

      if (!request.instructions) {
        request.instructions = [...wrappedSolInstructions]
      } else {
        request.instructions.push(...wrappedSolInstructions)
      }
      request.accounts.payerTokenAccount = wrappedSolAccount
    }

    if (hub) {
      const tx = await program.transaction.releasePurchaseViaHub(
        release.price,
        decodeNonEncryptedByteArray(hub.handle),
        request
      )
      tx.recentBlockhash = (
        await provider.connection.getRecentBlockhash()
      ).blockhash
      tx.feePayer = provider.wallet.publicKey
      return await provider.wallet.sendTransaction(tx, provider.connection)
    } else {
      const tx = await program.transaction.releasePurchase(
        release.price,
        request
      )
      tx.recentBlockhash = (
        await provider.connection.getRecentBlockhash()
      ).blockhash
      tx.feePayer = provider.wallet.publicKey
      return await provider.wallet.sendTransaction(tx, provider.connection)
    }
  }
}

export default releasePurchaseHelper
