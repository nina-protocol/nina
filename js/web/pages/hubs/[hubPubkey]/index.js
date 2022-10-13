import axios from 'axios'
import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import { styled } from '@mui/system'
const Hub = dynamic(() => import('../../../components/Hub'))
const HubPage = (props) => {

  return (
    <>
    <Head>
        <title>{`Nina: ${
          hubData?.json.displayName ? `${hubData.json.displayName}'s Hub` : ''
        }`}</title>
        <meta
          name="description"
          content={`${hubData?.json.displayName}'s Hub on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            hubData?.json.displayName ? `${hubData.json.displayName}'s Hub` : ''
          }`}
        />
        <meta
          name="og:description"
          content={`${
            hubData?.json.displayName ? hubData?.json.displayName : ''
          }: ${
            hubData?.json.description ? hubData?.json.description : ''
          } \n Published via Nina Hubs.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${hubData?.json.displayName}'s Hub on Nina`}
        />
        <meta name="twitter:description" content={hubData?.json.description} />
        <meta name="twitter:image" content={hubData?.json.image} />
        <meta name="og:image" content={hubData?.json.image} />
      </Head>
    <ResponsiveHubContainer >
      <Hub hubPubkey={props.hubPubkey} />
      </ResponsiveHubContainer>
    </>
  )
}

const ResponsiveHubContainer = styled(Box)(({theme}) => ({
  width: theme.maxWidth,
 
  [theme.breakpoints.down('md')]: {
    minHeight:'40vh'
  }
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
  const indexerUrl = process.env.INDEXER_URL
  const hubPubkey = context.params.hubPubkey
  const indexerPath = indexerUrl + `/hubs/${hubPubkey}`

  let hub
  if (hubPubkey && hubPubkey !== 'manifest.json') {
    try {
      const result = await axios.get(indexerPath)
      const data = result.data
      hub = data.hub
      return {
        props: {
          hub,
          hubPubkey: hub.id,
        },
        revalidate: 10,
      }
    } catch (error) {
      console.warn(error)
    }
  }
  return { props: {} }
}
