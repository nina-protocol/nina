import * as anchor from '@project-serum/anchor'
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
  swapQuoteByInputToken,
  AccountFetcher,
  swapQuoteByOutputToken,
} from '@orca-so/whirlpools-sdk'
import { Percentage } from "@orca-so/common-sdk";
import {
  createMintInstructions,
  findOrCreateAssociatedTokenAccount,
  wrapSol,
  TOKEN_PROGRAM_ID,
} from './web3'

const PRIORITY_SWAP_FEE = 7500
const WHIRLPOOL_PROGRAM_ID = new anchor.web3.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
const SOL_USDC_WHIRLPOOL = new anchor.web3.PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ')

const requiresSwap = (release, usdcBalance, ninaClient) => {
  return !ninaClient.isSol(release.paymentMint) && 
    usdcBalance < ninaClient.nativeToUi(release.price.toNumber(), ninaClient.ids.mints.usdc)
}

const releasePurchaseWithOrcaSwap = async (release, connection, program, wallet, instructions, request) => {
  const context = WhirlpoolContext.from(connection, wallet, WHIRLPOOL_PROGRAM_ID)
  const fetcher = new AccountFetcher(context.provider.connection)

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)
  const whirlpoolData = await whirlpool.getData()

  const outputTokenQuote = await swapQuoteByOutputToken(
    whirlpool,
    whirlpoolData.tokenMintB,
    release.price,
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

  const tx = await whirlpool.swap(inputTokenQuote)

  const addPriorityFeeIx =
    anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: PRIORITY_SWAP_FEE,
    })
  
  tx.prependInstruction({
    instructions: [addPriorityFeeIx],
    cleanupInstructions: [],
    signers: [],
  })

  const purchaseIx = await program.instruction.releasePurchase(release.price, request)
  instructions.push({
    instructions: [purchaseIx],
    cleanupInstructions: [],
    signers: [],
  })

  tx.addInstructions(instructions)

  return await tx.buildAndExecute()
}

const releasePurchaseHelper = async (releasePublicKey, provider, ninaClient, usdcBalance) => {
  releasePublicKey = new anchor.web3.PublicKey(releasePublicKey)
  const program = await ninaClient.useProgram()
  const release = await program.account.release.fetch(
    releasePublicKey
  )

  let [payerTokenAccount, payerTokenAccountIx] =
    await findOrCreateAssociatedTokenAccount(
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
      release: releasePublicKey,
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

  const instructions = []
  if (receiverReleaseTokenAccountIx) {
    instructions.push({
      instructions: [receiverReleaseTokenAccountIx],
      cleanupInstructions: [],
      signers: [],
    })
  }

  if (requiresSwap(release, usdcBalance, ninaClient)) {
    return releasePurchaseWithOrcaSwap(release, provider.connection, program, provider.wallet, instructions, request)
  } else {
    if (instructions.length > 0) {
      request.instructions = instructions.reduce((acc, curr) => {
        return acc.push(...curr.instructions)
      }, [])
    }

    if (ninaClient.isSol(release.paymentMint)) {
      const { instructions, signers } = await wrapSol(
        provider,
        new anchor.BN(release.price)
      )
      if (!request.instructions) {
        request.instructions = [...instructions]
      } else {
        request.instructions.push(...instructions)
      }
      request.signers = signers
      request.accounts.payerTokenAccount = signers[0].publicKey
    }

    return await program.rpc.releasePurchase(release.price, request)
  }
}

export default releasePurchaseHelper