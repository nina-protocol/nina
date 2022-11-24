import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import Dots from '../../components/Dots'
const Release = dynamic(() => import('../../components/Release'))
const NotFound = dynamic(() => import('../../components/NotFound'))

const ReleasePage = (props) => {
  const { metadata, loading } = props

  if (!metadata) {
    return <NotFound />
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
      {loading ? (
        <Dots size="80px" />
      ) : (
        <Release metadataSsr={metadata} />
      )}
    </>
  )
}

export default ReleasePage

export const getStaticPaths = async () => {
  await initSdkIfNeeded(true)
  const paths = []
  const { releases } = await NinaSdk.Release.fetchAll({ limit: 2000 })
  releases.forEach((release) => {
    paths.push({
      params: {
        releasePubkey: release.publicKey,
      },
    })
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps = async (context) => {
  const releasePubkey = context.params.releasePubkey

  try {
    await initSdkIfNeeded(true)
    const { release } = await NinaSdk.Release.fetch(releasePubkey)
    return {
      props: {
        metadata: release.metadata,
        releasePubkey,
        openGraphData: [
          {
            property: 'og:title',
            content: `${release.metadata?.properties.artist} - "${release.metadata?.properties.title}" on Nina`,
          },
          {
            property: 'og:description',
            content: `${release.metadata?.properties.artist} - "${release.metadata?.properties.title}": ${release.metadata?.description} \n Published on Nina.`,
          },
          {
            property: 'og:image',
            content: release.metadata?.image,
          },
          {
            property: 'twitter:card',
            content: 'summary_large_image',
          },
          {
            property: 'twitter:site',
            content: '@ninaprotocol',
          },
          {
            property: 'twitter:creator',
            content: '@ninaprotocol',
          },
          {
            property: 'twitter:image:type',
            content: 'image/jpg',
          },
          {
            property: 'twitter:title',
            content: `${release.metadata?.properties.artist} - "${release.metadata?.properties.title}" on Nina`,
          },
          {
            property: 'twitter:description',
            content: release.metadata?.description,
          },
          {
            property: 'twitter:image',
            content: release.metadata?.image,
          },
        ],
      },
      revalidate: 1000,
    }
  } catch (error) {
    console.warn(error)
    return { props: {} }
  }
}
