const {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
} = require('@solana/web3.js'
import { deserializeUnchecked, serialize } from 'borsh'
const METAPLEX_PROGRAM_PUBLIC_KEY = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)
const PubKeysInternedMap = new Map()
export const toPublicKey = (key) => {
  if (typeof key !== 'string') {
    return key
  }
  let result = PubKeysInternedMap.get(key)
  if (!result) {
    result = new PublicKey(key)
    PubKeysInternedMap.set(key, result)
  }
  return result
}
export const METADATA_PREFIX = 'metadata'
export const EDITION = 'edition'
export const RESERVATION = 'reservation'
export const MAX_NAME_LENGTH = 32
export const MAX_SYMBOL_LENGTH = 10
export const MAX_URI_LENGTH = 200
export const MAX_CREATOR_LIMIT = 5
export const MAX_CREATOR_LEN = 32 + 1 + 1
export const MAX_METADATA_LEN =
  1 +
  32 +
  32 +
  MAX_NAME_LENGTH +
  MAX_SYMBOL_LENGTH +
  MAX_URI_LENGTH +
  MAX_CREATOR_LIMIT * MAX_CREATOR_LEN +
  2 +
  1 +
  1 +
  198
export const MAX_EDITION_LEN = 1 + 32 + 8 + 200
export const EDITION_MARKER_BIT_SIZE = 248
export var MetadataKey
;(function (MetadataKey) {
  MetadataKey[(MetadataKey['Uninitialized'] = 0)] = 'Uninitialized'
  MetadataKey[(MetadataKey['MetadataV1'] = 4)] = 'MetadataV1'
  MetadataKey[(MetadataKey['EditionV1'] = 1)] = 'EditionV1'
  MetadataKey[(MetadataKey['MasterEditionV1'] = 2)] = 'MasterEditionV1'
  MetadataKey[(MetadataKey['MasterEditionV2'] = 6)] = 'MasterEditionV2'
  MetadataKey[(MetadataKey['EditionMarker'] = 7)] = 'EditionMarker'
})(MetadataKey || (MetadataKey = {}))
export var MetadataCategory
;(function (MetadataCategory) {
  MetadataCategory['Audio'] = 'audio'
  MetadataCategory['Video'] = 'video'
  MetadataCategory['Image'] = 'image'
  MetadataCategory['VR'] = 'vr'
})(MetadataCategory || (MetadataCategory = {}))
export class MasterEditionV1 {
  constructor(args) {
    this.key = MetadataKey.MasterEditionV1
    this.supply = args.supply
    this.maxSupply = args.maxSupply
    this.printingMint = args.printingMint
    this.oneTimePrintingAuthorizationMint =
      args.oneTimePrintingAuthorizationMint
  }
}
export class MasterEditionV2 {
  constructor(args) {
    this.key = MetadataKey.MasterEditionV2
    this.supply = args.supply
    this.maxSupply = args.maxSupply
  }
}
export class EditionMarker {
  constructor(args) {
    this.key = MetadataKey.EditionMarker
    this.ledger = args.ledger
  }
  editionTaken(edition) {
    const editionOffset = edition % EDITION_MARKER_BIT_SIZE
    const indexOffset = Math.floor(editionOffset / 8)
    if (indexOffset > 30) {
      throw Error('bad index for edition')
    }
    const positionInBitsetFromRight = 7 - (editionOffset % 8)
    const mask = Math.pow(2, positionInBitsetFromRight)
    const appliedMask = this.ledger[indexOffset] & mask
    return appliedMask != 0
  }
}
export class Edition {
  constructor(args) {
    this.key = MetadataKey.EditionV1
    this.parent = args.parent
    this.edition = args.edition
  }
}
export class Creator {
  constructor(args) {
    this.address = args.address
    this.verified = args.verified
    this.share = args.share
  }
}
export class Data {
  constructor(args) {
    this.name = args.name
    this.symbol = args.symbol
    this.uri = args.uri
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints
    this.creators = args.creators
  }
}
export class Metadata {
  constructor(args) {
    this.key = MetadataKey.MetadataV1
    this.updateAuthority = args.updateAuthority
    this.mint = args.mint
    this.data = args.data
    this.primarySaleHappened = args.primarySaleHappened
    this.isMutable = args.isMutable
    this.editionNonce = args.editionNonce
  }
  async init() {}
}
class CreateMetadataArgs {
  constructor(args) {
    this.instruction = 0
    this.data = args.data
    this.isMutable = args.isMutable
  }
}
class UpdateMetadataArgs {
  constructor(args) {
    this.instruction = 1
    this.data = args.data ? args.data : null
    this.updateAuthority = args.updateAuthority ? args.updateAuthority : null
    this.primarySaleHappened = args.primarySaleHappened
  }
}
class CreateMasterEditionArgs {
  constructor(args) {
    this.instruction = 10
    this.maxSupply = args.maxSupply
  }
}
class MintPrintingTokensArgs {
  constructor(args) {
    this.instruction = 9
    this.supply = args.supply
  }
}
export const METADATA_SCHEMA = new Map([
  [
    CreateMetadataArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['data', Data],
        ['isMutable', 'u8'], // bool
      ],
    },
  ],
  [
    UpdateMetadataArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['data', { kind: 'option', type: Data }],
        ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
        ['primarySaleHappened', { kind: 'option', type: 'u8' }],
      ],
    },
  ],
  [
    CreateMasterEditionArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
      ],
    },
  ],
  [
    MintPrintingTokensArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['supply', 'u64'],
      ],
    },
  ],
  [
    MasterEditionV1,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['supply', 'u64'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
        ['printingMint', 'pubkeyAsString'],
        ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
      ],
    },
  ],
  [
    MasterEditionV2,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['supply', 'u64'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
      ],
    },
  ],
  [
    Edition,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['parent', 'pubkeyAsString'],
        ['edition', 'u64'],
      ],
    },
  ],
  [
    Data,
    {
      kind: 'struct',
      fields: [
        ['name', 'string'],
        ['symbol', 'string'],
        ['uri', 'string'],
        ['sellerFeeBasisPoints', 'u16'],
        ['creators', { kind: 'option', type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: 'struct',
      fields: [
        ['address', 'pubkeyAsString'],
        ['verified', 'u8'],
        ['share', 'u8'],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['updateAuthority', 'pubkeyAsString'],
        ['mint', 'pubkeyAsString'],
        ['data', Data],
        ['primarySaleHappened', 'u8'],
        ['isMutable', 'u8'], // bool
      ],
    },
  ],
  [
    EditionMarker,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['ledger', [31]],
      ],
    },
  ],
])
export async function updateMetadataIx(
  data,
  metadataUri,
  newUpdateAuthority,
  primarySaleHappened,
  mintKey,
  updateAuthority,
  metadataAccount
) {
  const creator = new Creator({
    address: updateAuthority,
    verified: true,
    share: 100,
  })
  data = new Data({
    name: data.name,
    symbol: data.symbol,
    sellerFeeBasisPoints: data.sellerFeeBasisPoints,
    creators: [creator],
    uri: metadataUri,
  })
  metadataAccount =
    metadataAccount ||
    (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          METAPLEX_PROGRAM_PUBLIC_KEY.toBuffer(),
          toPublicKey(mintKey).toBuffer(),
        ],
        METAPLEX_PROGRAM_PUBLIC_KEY
      )
    )[0].toBase58()
  const value = new UpdateMetadataArgs({
    data,
    updateAuthority: !newUpdateAuthority ? undefined : newUpdateAuthority,
    primarySaleHappened:
      primarySaleHappened === null || primarySaleHappened === undefined
        ? null
        : primarySaleHappened,
  })
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value))
  const keys = [
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: true,
      isWritable: false,
    },
  ]
  const updateMetadataIx = new TransactionInstruction({
    keys,
    programId: METAPLEX_PROGRAM_PUBLIC_KEY,
    data: txnData,
  })
  return updateMetadataIx
}
export async function createMetadataIx(
  data,
  updateAuthority,
  mintKey,
  mintAuthorityKey,
  payer
) {
  const METAPLEX_PROGRAM_PUBLIC_KEY = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  )
  const creator = new Creator({
    address: payer,
    verified: true,
    share: 100,
  })
  const metadataAccount = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_PUBLIC_KEY.toBuffer(),
        toPublicKey(mintKey).toBuffer(),
      ],
      METAPLEX_PROGRAM_PUBLIC_KEY
    )
  )[0]
  data = new Data({
    ...data,
    creators: [creator],
  })
  const value = new CreateMetadataArgs({ data, isMutable: true })
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value))
  const keys = [
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintKey),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(mintAuthorityKey),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]
  let ix = new TransactionInstruction({
    keys,
    programId: METAPLEX_PROGRAM_PUBLIC_KEY,
    data: txnData,
  })
  return ix
}
const METADATA_REPLACE = new RegExp('\u0000', 'g')
export const decodeMetadata = (buffer) => {
  const metadata = deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer)
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '')
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '')
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '')
  return metadata
}
