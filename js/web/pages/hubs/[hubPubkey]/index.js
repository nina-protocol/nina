import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import { styled } from '@mui/system'
import NinaSdk from '@nina-protocol/js-sdk'
import Head from 'next/head'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import { useContext, useMemo, useEffect, useState } from 'react'
const HubView = dynamic(() => import('../../../components/Hub'))
const HubPage = ({ hub, hubPubkey }) => {
  const {
    getHub,
    hubState,
  } = useContext(Hub.Context)
  const [fetched, setFetched] = useState({
    info: false,
    releases: false,
    collaborators: false,
  })
  const hubData = useMemo(() => {
    if (hubState[hubPubkey]) {
      setFetched({ ...fetched, info: true })
      return hubState[hubPubkey]
    } else {
      getHub(hubPubkey)
    }
  }, [hubState, hubPubkey])

<<<<<<< HEAD
  useEffect(() => {
    if (hubPubkey) {
      getHub(hubPubkey)
    }
  }, [hubPubkey])
  
  return (
    <>
      <Head>
        <title>{`Nina: ${
          hubData?.data.displayName ? `${hubData.data.displayName}'s Hub` : ''
        }`}</title>
        <meta
          name="description"
          content={`${hubData?.data.displayName}'s Hub on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            hubData?.data.displayName ? `${hubData.data.displayName}'s Hub` : ''
          }`}
        />
        <meta
          name="og:description"
          content={`${
            hubData?.data.displayName ? hubData?.data.displayName : ''
          }: ${
            hubData?.data.description ? hubData?.data.description : ''
          } \n Published via Nina Hubs.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${hubData?.data.displayName}'s Hub on Nina`}
        />
        <meta name="twitter:description" content={hubData?.data.description} />
        <meta name="twitter:image" content={hubData?.data.image} />
        <meta name="og:image" content={hubData?.data.image} />
      </Head>

      <ResponsiveHubContainer>
        <HubView hubPubkey={hubPubkey} />
      </ResponsiveHubContainer>
    </>
=======
const Hub = dynamic(() => import('../../../components/Hub'))
const HubPage = ({ hub, hubPubkey }) => {
  return (
    <ResponsiveHubContainer>
      <Hub hubPubkey={hubPubkey} hubHandle={hub.handle} />
    </ResponsiveHubContainer>
>>>>>>> feaeef47f6e22a0eb211f429a9bb28177aa396d9
  )
}

const ResponsiveHubContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,

  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
  },
}))

export default HubPage

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          hubPubkey: 'placeholder',
        },
      },
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (context) => {
  const { hubPubkey } = context.params
  if (hubPubkey && hubPubkey !== 'manifest.json') {
    try {
      if (!NinaSdk.client.program) {
        await NinaSdk.client.init(
          process.env.NINA_API_ENDPOINT,
          process.env.SOLANA_CLUSTER_URL,
          process.env.NINA_PROGRAM_ID
        )
      }
      const { hub } = await NinaSdk.Hub.fetch(hubPubkey)
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
