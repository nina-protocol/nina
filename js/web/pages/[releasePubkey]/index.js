import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import { useRouter } from 'next/router'
const Release = dynamic(() => import('../../components/Release'))
const NotFound = dynamic(() => import('../../components/NotFound'))

const ReleasePage = (props) => {
  const { metadata } = props
  const { isFallback } = useRouter()

  if (isFallback) {
    return <></>
  }

  if (!metadata) {
    return <NotFound />
  }
  return (
    <>
      <Release metadataSsr={metadata} />
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
        metaTags: [
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
