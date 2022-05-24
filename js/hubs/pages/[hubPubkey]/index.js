import * as anchor from '@project-serum/anchor'
import axios from 'axios'
import Head from 'next/head'
import Hub from '../../components/Hub'

const HubPage = (props) => {
  // console.log("hub, hubPubkey ::> ", hub, hubPubkey)
  const { hub, hubPubkey} = props
  console.log('hub !!!! :>> ', hub);
  return (
    <>
      <Head>
        <title>{`${hub?.json.displayName}`}</title>
        <meta
          name="description"
          content={`${hub?.json.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub?.json.displayName}`} />
        <meta
          name="og:description"
          content={`${hub?.json.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub?.json.displayName}`} />
        <meta name="twitter:description" content={hub?.json.description} />

        <meta name="twitter:image" content={hub?.json.image} />
        <meta name="og:image" content={hub?.json.image} />
      </Head>
      <Hub hubPubkey={hubPubkey} />
    </>
  )
}

HubPage.getInitialProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL
  const hubPubkey= context.query.hubPubkey
  const indexerPath = indexerUrl + `hubs/${hubPubkey}`
  let hub;

  try {
    const result = await axios.get(indexerPath)
    const data = result.data
    hub = result.data.hub
  } catch (error) {
    console.warn(error)
  }

  return {
    hub,
    hubPubkey
  }
}
export default HubPage
