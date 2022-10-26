import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import { styled } from '@mui/system'
import NinaSdk from '@nina-protocol/js-sdk'

const Hub = dynamic(() => import('../../../components/Hub'))
const HubPage = ({ hub, hubPubkey }) => {
  return (
    <ResponsiveHubContainer>
      <Hub hubPubkey={hubPubkey} hubHandle={hub.handle} />
    </ResponsiveHubContainer>
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
