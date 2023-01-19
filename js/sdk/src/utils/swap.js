import * as anchor from '@project-serum/anchor'
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
  swapQuoteByInputToken,
  AccountFetcher,
  swapQuoteByOutputToken,
} from '@orca-so/whirlpools-sdk'
import { Percentage } from "@orca-so/common-sdk";
import { Numberu64 } from "@bonfida/spl-name-service";

const WHIRLPOOL_PROGRAM_ID = new anchor.web3.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
const SOL_USDC_WHIRLPOOL = new anchor.web3.PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ')

export const swap = async (connection, wallet, amount) => {
  const context = WhirlpoolContext.from(connection, wallet, WHIRLPOOL_PROGRAM_ID)
  const fetcher = new AccountFetcher(context.provider.connection)

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)
  const whirlpoolData = await whirlpool.getData()
  console.log('whirlpoolData.tokenMintB', whirlpoolData)
  const outputTokenQuote = await swapQuoteByOutputToken(
    whirlpool,
    whirlpoolData.tokenMintB,
    new Numberu64(amount),
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
  console.log('wallet', wallet.publicKey.toBase58())
  console.log('outputTokenQuote.amount', outputTokenQuote.amount.toNumber())
  console.log('estimatedAmountIn', outputTokenQuote.estimatedAmountIn.toNumber())
  console.log('estimatedAmountOut', outputTokenQuote.estimatedAmountOut.toNumber())
  console.log('outputTokenQuote', outputTokenQuote)
  const tx = await whirlpool.swap(inputTokenQuote)
  console.log('tx', tx)
  return tx
}