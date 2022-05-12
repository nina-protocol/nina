import * as anchor from '@project-serum/anchor'
import axios from 'axios'
import Head from 'next/head'
import Hub from '../components/Hub'

const HubPage = ({ hubPubkey, hub }) => {
  return (
    <>
      <Head>
        <title>{`${hub.metadata?.displayName}`}</title>
        <meta
          name="description"
          content={`${hub.metadata?.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub.metadata?.displayName}`} />
        <meta
          name="og:description"
          content={`${hub.metadata?.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub.metadata?.displayName}`} />
        <meta name="twitter:description" content={hub.metadata?.description} />

        <meta name="twitter:image" content={hub.metadata?.image} />
        <meta name="og:image" content={hub.metadata?.image} />
      </Head>
      <Hub hubPubkey={hubPubkey} hub={hub} />
    </>
  )
}

HubPage.getInitialProps = async ({ req }) => {
  const loadHub = async (req) => {
    const provider = new anchor.AnchorProvider(
      new anchor.web3.Connection(process.env.REACT_APP_CLUSTER_URL)
    )
    const program = await anchor.Program.at(
      process.env.REACT_PROGRAM_ID,
      provider
    )

    let hubData = await program.account.hub.fetch(
      new anchor.web3.PublicKey(process.env.REACT_HUB_PUBLIC_KEY)
    )
    const uri = new TextDecoder()
      .decode(new Uint8Array(hubData.uri))
      .replace(/\u0000/g, '')
    const metadata = await axios.get(uri)
    hubData.json = metadata.data
    hubData.handle = new TextDecoder()
      .decode(new Uint8Array(hubData.name))
      .replace(/\u0000/g, '')
    if (!req) {
      localStorage.setItem('hub', JSON.stringify(hubData))
    }
    return hubData
  }

  let hub
  if (req) {
    hub = await loadHub(req)
  } else {
    hub = localStorage.getItem('hub')
    if (hub) {
      hub = JSON.parse(hub)
    } else {
      hub = await loadHub(req)
      localStorage.setItem('hub', JSON.stringify(hub))
    }
  }

  return {
    hub,
  }
}
export default HubPage
