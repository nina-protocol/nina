import Dashboard from '../../components/Dashboard'
import NinaSdk from '@nina-protocol/js-sdk'
import Head from 'next/head'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'

const DashboardPage = ({ hub, loading }) => {
  return (
    <>
      <Head>
        <title>{`Nina Hubs - ${hub?.data.displayName} Dashboard`}</title>
        <meta name="og:type" content="website" />
        <meta name="description" content={`Hubs. Powered by Nina.`} />
        <meta name="og:image" content={hub?.data.image} />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta
          name="twitter:image"
          content="https://hubs.ninaprotocol.com/images/nina-blue.png"
        />
        <meta
          name="og:image"
          href="https://hubs.ninaprotocol.com/images/nina-blue.png"
        />
      </Head>
      {loading ? <Dots size="80px" /> : <Dashboard hubPubkey={hub.publicKey} />}
    </>
  )
}

DashboardPage.getInitialProps = async (context) => {
  try {
    await initSdkIfNeeded(true)
    const { hub } = await NinaSdk.client.Hub.fetch(context.query.hubPubkey)
    return {
      hub,
    }
  } catch (error) {
    console.warn(error)
    return {}
  }
}
export default DashboardPage
