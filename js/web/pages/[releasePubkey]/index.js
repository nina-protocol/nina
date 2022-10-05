import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
const Release = dynamic(() => import('../../components/Release'))
const NotFound = dynamic(() => import('../../components/NotFound'))

const ReleasePage = (props) => {
  const { metadata } = props

  if (!metadata) {
    return (
      <NotFound />
    )
  }
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
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on Nina`}
        />
        <meta name="twitter:description" content={metadata?.description} />

        <meta name="twitter:image" content={metadata?.image} />
        <meta name="og:image" content={metadata?.image} />
      </Head>
      <Release metadataSsr={metadata} />
    </>
  )
}

export default ReleasePage

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          releasePubkey: 'placeholder',
        }
      }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps = async (context) => {
  const releasePubkey = context.params.releasePubkey

  try {
    const metadataResult = await fetch(
      `${process.env.INDEXER_URL}/metadata/bulk`,
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
      },
      revalidate: 10
    }
  } catch (error) {
    console.warn(error);
  }
  return {props: {}}
}

