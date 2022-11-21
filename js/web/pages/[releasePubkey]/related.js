import NinaSdk from '@nina-protocol/js-sdk'
const { useRouter } = require('next/router')
const { initSdkIfNeeded } = require('@nina-protocol/nina-internal-sdk/src/utils/sdkInit')

const Related = (props) => {
  const { publisher } = props
  const router = useRouter()
  router.push(`/profiles/${publisher}`)
  return null
}

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey

  try {
    await initSdkIfNeeded(true)
    const { release } = await NinaSdk.Release.fetch(releasePubkey)
    return {
      props: {
        publisher: release.publisher,
      },
    }
  } catch (error) {
    console.warn(error)
    return { props: {} }
  }
}

export default Related
