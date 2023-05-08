import * as anchor from '@project-serum/anchor'
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
  swapQuoteByInputToken,
  AccountFetcher,
} from '@orca-so/whirlpools-sdk'
import { Percentage } from '@orca-so/common-sdk'
import { getConfirmTransaction } from '.'

const WHIRLPOOL_PROGRAM_ID = new anchor.web3.PublicKey(
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
)
const SOL_USDC_WHIRLPOOL = new anchor.web3.PublicKey(
  'HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ'
)

export const swapQuote = async (
  wallet,
  connection,
  amount,
  isSolToUsdc = true
) => {
  const context = WhirlpoolContext.from(
    connection,
    wallet,
    WHIRLPOOL_PROGRAM_ID
  )
  const fetcher = new AccountFetcher(connection)

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)
  const whirlpoolData = await whirlpool.getData()

  const inputTokenQuote = await swapQuoteByInputToken(
    whirlpool,
    isSolToUsdc ? whirlpoolData.tokenMintA : whirlpoolData.tokenMintB,
    new anchor.BN(amount),
    Percentage.fromFraction(1, 1000),
    context.program.programId,
    fetcher,
    true
  )

  return inputTokenQuote
}

export const swap = async (quote, wallet, connection) => {
  const context = WhirlpoolContext.from(
    connection,
    wallet,
    WHIRLPOOL_PROGRAM_ID
  )

  const whirlpoolClient = buildWhirlpoolClient(context)
  const whirlpool = await whirlpoolClient.getPool(SOL_USDC_WHIRLPOOL, true)

  const txBuilder = await whirlpool.swap(quote)
  const tx = await txBuilder.build()

  if (tx.signers.length > 0) {
    tx.transaction.partialSign(...tx.signers)
  }
  const txid = await wallet.sendTransaction(tx.transaction, connection)
  await getConfirmTransaction(txid, connection)
  return
}
