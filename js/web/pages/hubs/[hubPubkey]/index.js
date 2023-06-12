import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import { styled } from '@mui/system'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
const HubView = dynamic(() => import('../../../components/Hub'))

const HubPage = ({ hub, hubPubkey, loading }) => {
  return (
    <>
      <Head>
        <title>{`Nina: ${
          hub?.data.displayName ? `${hub.data.displayName}'s Hub` : ''
        }`}</title>
        <meta
          name="description"
          content={`${hub?.data.displayName}'s Hub on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            hub?.data.displayName ? `${hub.data.displayName}'s Hub` : ''
          }`}
        />
        <meta
          name="og:description"
          content={`${hub?.data.displayName ? hub?.data.displayName : ''}: ${
            hub?.data.description ? hub?.data.description : ''
          } \n Published via Nina Hubs.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${hub?.data.displayName}'s Hub on Nina`}
        />
        <meta name="twitter:description" content={hub?.data.description} />
        <meta name="twitter:image" content={hub?.data.image} />
        <meta name="og:image" content={hub?.data.image} />
      </Head>
      {loading ? (
        <Dots size="80px" />
      ) : (
        <HubPageContainer>
          <HubView hubPubkey={hubPubkey} />
        </HubPageContainer>
      )}
    </>
  )
}

const HubPageContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,

  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
  },
}))

export default HubPage

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
  const { hubPubkey } = context.params
  if (hubPubkey && hubPubkey !== 'manifest.json') {
    try {
      await initSdkIfNeeded(true)
      const { hub } = await NinaSdk.client.Hub.fetch(hubPubkey)
      return {
        props: {
          hub,
          hubPubkey: hub.publicKey,
        },
        revalidate: 10,
      }
    } catch (error) {
      console.warn(error)
    }
  }
  return { props: {} }
}
