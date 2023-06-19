import * as anchor from '@project-serum/anchor'
const BufferLayout = require('buffer-layout')

export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  anchor.utils.token.TOKEN_PROGRAM_ID.toString()
)

export const ASSOCIATED_TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  anchor.utils.token.ASSOCIATED_PROGRAM_ID.toString()
)

import { createSyncNativeInstruction } from '@solana/spl-token'

export async function createMintInstructions(
  provider,
  authority,
  mint,
  decimals
) {
  const tokenProgram = anchor.Spl.token(provider)
  const systemProgram = anchor.Native.system(provider)
  const mintSize = tokenProgram.coder.accounts.size(
    tokenProgram.idl.accounts[0]
  )

  const mintRentExemption =
    await provider.connection.getMinimumBalanceForRentExemption(mintSize)

  let instructions = [
    await systemProgram.methods
      .createAccount(
        new anchor.BN(mintRentExemption),
        new anchor.BN(mintSize),
        tokenProgram.programId
      )
      .accounts({
        from: authority,
        to: mint,
      })
      .instruction(),
    await tokenProgram.methods
      .initializeMint(decimals, authority, null)
      .accounts({
        mint,
      })
      .instruction(),
  ]

  return instructions
}

export const findOrCreateAssociatedTokenAccount = async (
  connection,
  payer,
  owner,
  systemProgramId,
  clockSysvarId,
  splTokenMintAddress,
  skipLookup = false
) => {
  const associatedTokenAddress = await findAssociatedTokenAddress(
    owner,
    splTokenMintAddress
  )

  let userAssociatedTokenAddress = null
  if (!skipLookup) {
    userAssociatedTokenAddress = await connection.getAccountInfo(
      associatedTokenAddress
    )
  }

  if (!userAssociatedTokenAddress) {
    const keys = [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedTokenAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: splTokenMintAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: systemProgramId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ]

    const ix = new anchor.web3.TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    })

    return [associatedTokenAddress, ix]
  } else {
    return [associatedTokenAddress, undefined]
  }
}

const getProgramFilters = (filterValues, layout) => {
  if (!filterValues) {
    return
  }
  const filters = []
  const BUFFER_LAYOUT = BufferLayout.struct(...[layout.fields])

  Object.keys(filterValues).forEach((filterValue) => {
    filters.push(
      {
        memcmp: {
          offset: BUFFER_LAYOUT.offsetOf(filterValue) + 8,
          bytes: filterValues[filterValue],
        },
      },
      {
        dataSize: layout.span + 8,
      }
    )
  })

  return filters
}

export const getProgramAccounts = async (
  program,
  accountStruct,
  filterValues,
  connection
) => {
  const layout = program.coder.accounts.accountLayouts.get(accountStruct)

  let filters = null
  if (filterValues) {
    filters = getProgramFilters(filterValues, layout)
  }

  let response = await connection.getProgramAccounts(program.programId, {
    commitment: connection.commitment,
    filters,
  })

  if (response.error) {
    return {
      error: Error(
        `failed to get program: ${program.programId.toBase58()} for filter: ${JSON.stringify(
          filterValues
        )} - ${response.error.message}`
      ),
    }
  } else {
    const results = response.map((result) => {
      try {
        let dataParsed = layout.decode(result.account.data.slice(8))
        dataParsed.publicKey = new anchor.web3.PublicKey(result.pubkey)
        return dataParsed
      } catch (error) {
        console.warn('error :>> ', error)
      }
    })

    const filteredResults = results.filter((result) => result !== undefined)
    return filteredResults
  }
}

export const postTwitterRegistrarRequest = async (
  transaction,
  userPubkey,
  twitterLink,
  twitterHandle
) => {
  const transactionBuffer = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })
  const payload = {
    transaction: JSON.stringify(transactionBuffer),
    pubkey: userPubkey.toBase58(),
    twitterLink: twitterLink,
    twitterHandle: twitterHandle,
  }
  const result = await apiPost(
    'https://naming-api.bonfida.com/registrar/twitter',
    payload,
    {
      'content-type': 'application/json',
    }
  )
  return result
}

export const apiPost = async (url, body, headers) => {
  if (!url) {
    throw new Error('apiPost - url undefined or null')
  }
  try {
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    })
    if (!response.ok) {
      throw new Error(`Error apiPost - status ${response.status}`)
    }
    let json = await response.json()
    return json
  } catch (err) {
    console.warn(err)
    throw new Error(`Error apiPost - err ${err}`)
  }
}

export const wrapSol = async (provider, amount, mint) => {
  const wrappedSolInstructions = []

  let [wrappedSolAccount, wrappedSolAccountIx] = await findOrCreateAssociatedTokenAccount(
    provider.connection,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    anchor.web3.SystemProgram.programId,
    anchor.web3.SYSVAR_RENT_PUBKEY,
    mint
  )

  if (wrappedSolAccountIx) {
    wrappedSolInstructions.push(wrappedSolAccountIx)
  }

  const wrappedSolTransferIx = anchor.web3.SystemProgram.transfer({
    fromPubkey: provider.wallet.publicKey,
    toPubkey: wrappedSolAccount,
    lamports: new anchor.BN(amount),git
  })
  // sync wrapped SOL balance
  const syncNativeIx = createSyncNativeInstruction(wrappedSolAccount)
  wrappedSolInstructions.push(wrappedSolTransferIx, syncNativeIx)
  return [wrappedSolAccount, wrappedSolInstructions]
}

export const getFilteredAnchorAccounts = async (
  program,
  AccountStruct,
  filterValue
) => {
  const layout = program.coder.accounts.accountLayouts.get(AccountStruct)
  const filters = [
    {
      memcmp: {
        offset:
          BufferLayout.struct(...[layout.fields]).offsetOf(
            Object.keys(filterValue)[0]
          ) + 8,
        bytes: Object.values(filterValue)[0],
      },
    },
  ]
  const accountInterface =
    AccountStruct.charAt(0).toLowerCase() + AccountStruct.slice(1)
  return await program.account[accountInterface].all(filters)
}

export const findAssociatedTokenAddress = async (
  ownerAddress,
  tokenMintAddress
) => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        ownerAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0]
}
