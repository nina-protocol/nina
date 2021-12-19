import * as anchor from '@project-serum/anchor'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import Release from "../components/Release";
import ninaCommon from 'nina-common'
import Head from "next/head";
const {NinaClient} = ninaCommon.utils

const ReleasePage = ({metadata}) => {
  return (
    <>
      <Head>
        <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nina_market_" />
        <meta name="twitter:creator" content="@nina_market_" />
        <meta
          name="twitter:title"
          content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
        />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://f4.bcbits.com/img/a0578492136_16.jpg" />
      </Head>
      <Release metadata={metadata}/>;
    </>
  )
};

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey
  const metadataResult = await fetch(
    `${NinaClient.endpoints.api}/metadata/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [releasePubkey] }),
    } 
  )
  const metadataJson = await metadataResult.json()

  return {
    props: {
      metadata: metadataJson[releasePubkey]
    }
  }
}

export default ReleasePage;
