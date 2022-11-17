import NinaSdk from '@nina-protocol/js-sdk'

export const initSdkIfNeeded = async () => {
  if (!NinaSdk.client.program) {
    if (process.env.USE_KEY === 'true') {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID,
        process.env.NINA_API_KEY
      );
    } else {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID
      );
    }
  }
}