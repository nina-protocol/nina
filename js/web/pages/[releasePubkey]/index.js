import React from 'react'
import nina from "@nina-protocol/nina-sdk";
import dynamic from 'next/dynamic';
import Head from 'next/head'
const Release = dynamic(() => import("../../components/Release"));

const ReleasePage = (props) => {
  const { metadata } = props
  return (
    <>
      <Head>
        <title>{`Nina: ${metadata?.properties.artist} - "${metadata?.properties.title}"`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on Nina`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nina_market_" />
        <meta name="twitter:creator" content="@nina_market_" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on Nina`}
        />
        <meta name="twitter:description" content={metadata?.description} />

        <meta name="twitter:image" content={metadata?.image} />
        <meta name="og:image" content={metadata?.image} />
      </Head>
      <Release metadataSsr={metadata} />;
    </>
  )
}

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey
  const metadataResult = await fetch(
    `http://localhost:3001/metadata/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [releasePubkey] }),
    }
  )
  const metadataJson = await metadataResult.json()
  return {
    props: {
      metadata: metadataJson[releasePubkey] || null,
      releasePubkey,
      host: context.req.headers.host,
    },
  }
}

export default ReleasePage
