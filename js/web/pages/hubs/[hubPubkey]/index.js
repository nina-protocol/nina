import axios from 'axios'
import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import { styled } from '@mui/system'
const Hub = dynamic(() => import('../../../components/Hub'))
const HubPage = (props) => {

  return (
    <ResponsiveHubContainer >
      <Hub hubPubkey={props.hubPubkey} />
      </ResponsiveHubContainer>
  )
}

const ResponsiveHubContainer = styled(Box)(({theme}) => ({
  width: theme.maxWidth,
  minHeight: '60vh',
  maxHeight:'100vh',
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
