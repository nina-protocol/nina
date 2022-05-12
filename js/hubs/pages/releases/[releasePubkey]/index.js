import React, { useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import * as anchor from '@project-serum/anchor'
import axios from 'axios'
const Release = dynamic(() => import('../../../components/Release'))
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

const ReleasePage = (props) => {
  const { metadata, hub, releasePubkey } = props
  return (
    <>
      <Head>
        <title>{`${metadata?.properties.artist} - "${metadata?.properties.title}"`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n  Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}"`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \nPowered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on ${hub?.json.displayName}`}
        />
        <meta name="twitter:description" content={metadata?.description} />

        <meta name="twitter:image" content={metadata?.image} />
        <meta name="og:image" content={metadata?.image} />
      </Head>
      <Release metadataSsr={metadata} releasePubkey={releasePubkey} />
    </>
  )
}

ReleasePage.getInitialProps = async (context) => {
  console.log("context.params ::> ", context)
  const releasePubkey = context.query.releasePubkey
  const metadataResult = await fetch(
    `https://api-dev.nina.market/metadata/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [releasePubkey] }),
    }
  )
  const metadataJson = await metadataResult.json()
  

  return {
    releasePubkey,
    metadata: metadataJson[releasePubkey] || null,
  }
}

export default ReleasePage
