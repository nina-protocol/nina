import * as anchor from '@project-serum/anchor'
import axios from 'axios'
import Head from 'next/head'
import Hub from '../../components/Hub'

const HubPage = ({ hubPubkey, hub }) => {
  console.log("hub, hubPubkey ::> ", hub, hubPubkey)
  return (
    <>
      <Head>
        <title>{`${hub.json?.displayName}`}</title>
        <meta
          name="description"
          content={`${hub.json?.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub.json?.displayName}`} />
        <meta
          name="og:description"
          content={`${hub.json?.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub.json?.displayName}`} />
        <meta name="twitter:description" content={hub.json?.description} />

        <meta name="twitter:image" content={hub.metadata?.image} />
        <meta name="og:image" content={hub.metadata?.image} />
      </Head>
      <Hub hubPubkey={hubPubkey} />
    </>
  )
}

HubPage.getInitialProps = async (req) => {
  const loadHub = async () => {
    const provider = new anchor.AnchorProvider(
      new anchor.web3.Connection(process.env.REACT_APP_CLUSTER_URL)
    )
    const program = await anchor.Program.at(
      process.env.REACT_PROGRAM_ID,
      provider
    )

    let hubData = await program.account.hub.fetch(
      new anchor.web3.PublicKey(req.query.hubPubkey)
    )
    const uri = new TextDecoder()
      .decode(new Uint8Array(hubData.uri))
      .replace(/\u0000/g, '')
    const metadata = await axios.get(uri)
    hubData.json = metadata.data
    hubData.handle = new TextDecoder()
      .decode(new Uint8Array(hubData.handle))
      .replace(/\u0000/g, '')
    return hubData
  }

  let hub = await loadHub(req)
  return {
    hub,
    hubPubkey: req.query.hubPubkey
  }
}
export default HubPage
