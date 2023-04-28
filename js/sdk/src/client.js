import * as anchor from '@project-serum/anchor'

export const NINA_CLIENT_IDS = {
  mainnet: {
    programs: {
      nina: 'ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4',
      metaplex: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
      token: anchor.utils.token.TOKEN_PROGRAM_ID.toString(),
    },
    accounts: {
      vault: '53ueyguZx5bHjgHQdU1EcoLkcupAt97wVbcYeAi6iAYy',
      vaultUsdc: 'HDhJyie5Gpck7opvAbYi5H22WWofAR3ygKFghdzDkmLf',
      vaultWrappedSol: '5NnBrUiqHsx1QnGVSo73AprxgVtRjcfmGrgwJ6q1ADzs',
    },
    mints: {
      usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      wsol: 'So11111111111111111111111111111111111111112',
      publishingCredit: 'NpCbciSYfzrSk9aQ2gkr17TX2fjkm6XGRYhkZ811QDE',
      hubCredit: 'NpCbciSYfzrSk9aQ2gkr17TX2fjkm6XGRYhkZ811QDE',
    },
  },
  devnet: {
    programs: {
      nina: '77BKtqWTbTRxj5eZPuFbeXjx3qz4TTHoXRnpCejYWiQH',
      metaplex: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
      token: anchor.utils.token.TOKEN_PROGRAM_ID.toString(),
    },
    accounts: {
      vault: 'AzhSWZCtvfRkzGzzAhPxzrvBcMBcYGKp2rwCh17hARhi',
      vaultUsdc: '2hyWtzYhwW4CSWs7TrrdhQ9DWRaKUVhSxsyVTzcyHRq6',
      vaultWrappedSol: 'H35oumnDdCu5VGXvp24puqYvUQ3Go1JXCGum7L2J3CSP',
    },
    mints: {
      usdc: 'J8Kvy9Kjot83DEgnnbK55BYbAK9pZuyYt4NBGkEJ9W1K',
      wsol: 'So11111111111111111111111111111111111111112',
      publishingCredit: 'NpCbciSYfzrSk9aQ2gkr17TX2fjkm6XGRYhkZ811QDE',
      hubCredit: 'NpCbciSYfzrSk9aQ2gkr17TX2fjkm6XGRYhkZ811QDE',
    },
  },
}

const USDC_DECIMAL_AMOUNT = 6
const SOL_DECIMAL_AMOUNT = 9

const NinaClient = function (provider, network) {
  var obj = Object.create(NinaClient.prototype)
  obj.network = network
  obj.ids = NINA_CLIENT_IDS[network]
  obj.provider = provider
  obj.ENDPOINT_ARWEAVE = 'https://arweave.net' //'https://h6chwwrsde.medianet.work'
  obj.endpoints = {
    arweave: obj.ENDPOINT_ARWEAVE,
    pressingPlant: 'https://pressingplant-dev.nina.market',
    api: process.env.NINA_API_ENDPOINT,
  }
  obj.decimalsForMint = (mint) => {
    switch (typeof mint === 'string' ? mint : mint.toBase58()) {
      case obj.ids.mints.usdc:
        return USDC_DECIMAL_AMOUNT
      case obj.ids.mints.wsol:
        return SOL_DECIMAL_AMOUNT
      default:
        return undefined
    }
  }
  obj.nativeToUi = (amount, mint) => {
    return amount / Math.pow(10, obj.decimalsForMint(mint))
  }
  obj.useProgram = async () => {
    const NINA_ID = obj.ids.programs.nina
    const idl = await anchor.Program.fetchIdl(NINA_ID, obj.provider)
    return new anchor.Program(idl, NINA_ID, obj.provider)
  }
  obj.isUsdc = (mint) => {
    if (typeof mint !== 'string') {
      return mint.toBase58() === obj.ids.mints.usdc
    }
    return mint === obj.ids.mints.usdc
  }
  obj.nativeToUiString = (
    amount,
    mint,
    decimalOverride = false,
    showCurrency = true
  ) => {
    const isUsdc = obj.isUsdc(mint)
    let amountString = obj
      .nativeToUi(amount, mint)
      .toFixed(isUsdc || decimalOverride ? 2 : 3)

    if (showCurrency) {
      amountString = `${isUsdc ? '$' : ''}${amountString} ${
        isUsdc ? 'USDC' : 'SOL'
      }`
    }
    return amountString
  }
  obj.uiToNative = (amount, mint) => {
    return Math.round(amount * Math.pow(10, obj.decimalsForMint(mint)))
  }
  obj.isSol = (mint) => {
    if (typeof mint !== 'string') {
      return mint.toBase58() === obj.ids.mints.wsol
    }
    return mint === obj.ids.mints.wsol
  }
  return obj
}

export default NinaClient
