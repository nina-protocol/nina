import * as anchor from '@project-serum/anchor'
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
  swapQuoteByOutputToken,
  AccountFetcher,
} from '@orca-so/whirlpools-sdk'
import { Percentage } from "@orca-so/common-sdk";
import { Numberu64 } from "@bonfida/spl-name-service";

const WHIRLPOOL_PROGRAM_ID = new anchor.web3.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
const SOL_USDC_WHIRLPOOL = new anchor.web3.PublicKey('7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm')

export const swap = async (connection, wallet, amount) => {
  const context = WhirlpoolContext.from(connection, wallet, WHIRLPOOL_PROGRAM_ID)
  const fetcher = new AccountFetcher(context.provider.connection)

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)
  const whirlpoolData = await whirlpool.getData()

  const outputTokenQuote = await swapQuoteByOutputToken(
    whirlpool,
    whirlpoolData.tokenMintB,
    new Numberu64(amount + (amount * 0.01)),
    Percentage.fromFraction(1, 250),
    context.program.programId,
    fetcher,
    true
  )
  
  console.log('outputTokenQuote.amount', outputTokenQuote.amount.toNumber())
  console.log('estimatedAmountIn', outputTokenQuote.estimatedAmountIn.toNumber())
  console.log('estimatedAmountOut', outputTokenQuote.estimatedAmountOut.toNumber())

  const tx = await whirlpool.swap(outputTokenQuote)
  console.log('tx', tx)
  return tx
}