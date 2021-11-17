import * as anchor from '@project-serum/anchor'
import { TokenInstructions } from '@project-serum/serum'
import Arweave from 'arweave'
import CoinGecko from 'coingecko-api'
import idl from './idl'

export const NINA_CLIENT_IDS = {
  mainnet: {
    programs: {
      nina: 'ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4',
      metaplex: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
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
    },
  },
  devnet: {
    programs: {
      nina: 'ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4',
      metaplex: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    },
    accounts: {
      vault: '53ueyguZx5bHjgHQdU1EcoLkcupAt97wVbcYeAi6iAYy',
      vaultUsdc: 'A6G4Dhr6G5kUUo7KH2yZUowmLZbjH2t1PafrbqCfH6C3',
      vaultWrappedSol: '5NnBrUiqHsx1QnGVSo73AprxgVtRjcfmGrgwJ6q1ADzs',
    },
    mints: {
      usdc: 'J8Kvy9Kjot83DEgnnbK55BYbAK9pZuyYt4NBGkEJ9W1K',
      wsol: 'So11111111111111111111111111111111111111112',
      publishingCredit: 'NpCbciSYfzrSk9aQ2gkr17TX2fjkm6XGRYhkZ811QDE',
    },
  },
}

const USDC_DECIMAL_AMOUNT = 6
const SOL_DECIMAL_AMOUNT = 9

const NINA_PRESSING_FEE = 0.00

const ENDPOINT_ARWEAVE = 'https://arweave.net' //'https://h6chwwrsde.medianet.work'
const ENDPOINT_PRESSING_PLANT = 'https://pressingplant-dev.nina.market:443'
const ENDPOINT_API = 'https://api-dev.nina.market:443'

const arweave = Arweave.init()
const CoinGeckoClient = new CoinGecko()

export default class NinaClient {
  constructor(program) {
    this.program = program
    this.ids = NINA_CLIENT_IDS[process.env.REACT_APP_CLUSTER]
  }

  static async connect(provider) {
    const NINA_ID = NINA_CLIENT_IDS[process.env.REACT_APP_CLUSTER].programs.nina
    const program = new anchor.Program(idl, NINA_ID, provider)

    return new NinaClient(program)
  }

  static TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
    TokenInstructions.TOKEN_PROGRAM_ID.toString()
  )
  static METAPLEX_PROGRAM_ID = new anchor.web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  )
  static WRAPPED_SOL_MINT_ID = new anchor.web3.PublicKey(
    'So11111111111111111111111111111111111111112'
  )

  static endpoints = {
    arweave: ENDPOINT_ARWEAVE,
    pressingPlant: ENDPOINT_PRESSING_PLANT,
    api: ENDPOINT_API,
  }

  static NINA_VAULT_FEE = 12500

  // Token Decimal Formatting

  static nativeToUi(amount, mint) {
    return amount / Math.pow(10, NinaClient.decimalsForMint(mint))
  }

  static nativeToUiString(amount, mint, decimalOverride = false, showCurrency = true) {
    const isUsdc = NinaClient.isUsdc(mint)
    let amountString = NinaClient.nativeToUi(amount, mint).toFixed(
      isUsdc || decimalOverride ? 2 : 4
    )

    if (showCurrency) {
      amountString = `${amountString} ${isUsdc ? 'USDC' : 'SOL'}`
    }
    return amountString
  }

  static uiToNative(amount, mint) {
    return Math.round(amount * Math.pow(10, NinaClient.decimalsForMint(mint)))
  }

  static isUsdc(mint) {
    return mint.toBase58() === NinaClient.ids().mints.usdc
  }

  static isSol(mint) {
    return mint.toBase58() === NinaClient.ids().mints.wsol
  }

  static decimalsForMint(mint) {
    switch (typeof mint === 'string' ? mint : mint.toBase58()) {
      case NinaClient.ids().mints.usdc:
        return USDC_DECIMAL_AMOUNT
      case NinaClient.ids().mints.wsol:
        return SOL_DECIMAL_AMOUNT
      default:
        return undefined
    }
  }

  static ids() {
    return NINA_CLIENT_IDS[process.env.REACT_APP_CLUSTER]
  }

  // Fee Calculators

  static pressingFeeCalculator(pressingAmount, storageFee, retailPrice) {
    let feeAmountForVault = Math.ceil(
      parseFloat(pressingAmount) * NINA_PRESSING_FEE
    )

    while (
      feeAmountForVault * parseFloat(retailPrice) <
      parseFloat(storageFee)
    ) {
      feeAmountForVault = feeAmountForVault * 2
    }

    return feeAmountForVault
  }

  static async pressingFeeArweaveStorageCalculator(artwork, track) {
    const artPriceWinston = await arweave.transactions.getPrice(
      artwork ? artwork.file.size : 0
    )
    const trackPriceWinston = await arweave.transactions.getPrice(
      track ? track.file.size : 0
    )

    const artPriceAr = await arweave.ar.winstonToAr(artPriceWinston)
    const trackPriceAr = await arweave.ar.winstonToAr(trackPriceWinston)

    const arExchangeRate = await CoinGeckoClient.simple.price({
      ids: ['arweave', 'solana'],
      vs_currencies: 'usd',
    })
    const usdCost =
      arExchangeRate.data.arweave.usd *
      (Number(artPriceAr) + Number(trackPriceAr))
    return usdCost
  }

  // Utilities

  static dateConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000)
    var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    var year = a.getFullYear()
    var month = months[a.getMonth()]
    var date = a.getDate()
    var hour = a.getHours().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    })
    var min = a.getMinutes().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    })
    var sec = a.getSeconds().toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    })
    var time =
      year + ' ' + month + '/' + date + ' ' + hour + ':' + min + ':' + sec
    return time
  }

  static arrayMove = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
  }

  static formatPlaceholder = (placeholder) => {
    return placeholder
      .match(/([A-Z0-9]?[^A-Z0-9]*)/g)
      .slice(0, -1)
      .join(' ')
      .toUpperCase()
  }

  static formatDuration = (duration) => {
    let sec_num = parseInt(duration, 10)
    let hours = Math.floor(sec_num / 3600)
    let minutes = Math.floor((sec_num - hours * 3600) / 60)
    let seconds = sec_num - hours * 3600 - minutes * 60

    if (minutes < 10) {
      minutes = '0' + minutes
    }
    if (seconds < 10) {
      seconds = '0' + seconds
    }
    return minutes + ':' + seconds
  }
}
