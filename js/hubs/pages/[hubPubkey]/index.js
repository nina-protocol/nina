import Head from 'next/head'
import Hub from '../../components/Hub'
import NotFound from '../../components/NotFound'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'

const HubPage = (props) => {
  const { hub, loading, hubPubkey } = props

  if (!hub) {
    return (
      <>
        <Head>
          <title>Nina Hubs - Not Found</title>
          <meta name="og:type" content="website" />
          <meta name="description" content={`Hubs. Powered by Nina.`} />
          <meta name="og:image" content={hub?.json.image} />
          <meta name="twitter:image:type" content="image/png" />
          <meta
            name="twitter:image"
            content="https://hubs.ninaprotocol.com/images/nina-blue.png"
          />
          <meta
            name="og:image"
            href="https://hubs.ninaprotocol.com/images/nina-blue.png"
          />
        </Head>
        <NotFound path={`/${hubPubkey}`} />
      </>
    )
  }
  return (
    <>
      <Head>
        <title>{`${hub?.data.displayName}`}</title>
        <meta
          name="description"
          content={`${hub?.data.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub?.data.displayName}`} />
        <meta
          name="og:description"
          content={`${hub?.data.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub?.data.displayName}`} />
        <meta name="twitter:description" content={hub?.data.description} />

        <meta name="twitter:image" content={hub?.data.image} />
        <meta name="og:image" content={hub?.data.image} />
      </Head>
      {loading ? <Dots size="80px" /> : <Hub hubPubkey={hub.publicKey} />}
    </>
  )
}

export const getStaticPaths = async () => {
  await initSdkIfNeeded(true)
  const paths = []
  const { hubs } = await NinaSdk.client.Hub.fetchAll({ limit: 1000 })
  hubs.forEach((hub) => {
    paths.push({
      params: { hubPubkey: hub.publicKey },
    })
    paths.push({
      params: { hubPubkey: hub.handle },
    })
  })
  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps = async (context) => {
  const hubPubkey = context.params.hubPubkey
  if (hubPubkey && hubPubkey !== 'manifest.json' && hubPubkey !== 'undefined') {
    try {
      await initSdkIfNeeded(true)
      const { hub } = await NinaSdk.client.Hub.fetch(hubPubkey)
      return {
        props: {
          hub,
          hubPubkey,
        },
        revalidate: 10,
      }
    } catch (error) {
      console.warn(error)
    }
  }
  return {
    props: {
      hubPubkey,
    },
  }
}
export default HubPage
