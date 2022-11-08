import NinaSdk from '@nina-protocol/js-sdk'
const { useRouter } = require('next/router')

const Related = (props) => {
  const { publisher } = props
  const router = useRouter()
  router.push(`/profiles/${publisher}`)
  return null
}

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey

  try {
    if (!NinaSdk.client.program) {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID
      )
    }
    const { release } = await NinaSdk.Release.fetch(releasePubkey)
    return {
      props: {
        publisher: release.publisher,
      },
    }
  } catch (error) {
    console.warn(error)
    return { props: {} }
  }}

export default Related
