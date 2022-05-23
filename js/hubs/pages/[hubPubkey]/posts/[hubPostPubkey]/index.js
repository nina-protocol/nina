import React, { useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import * as anchor from '@project-serum/anchor'
import axios from 'axios'
const Post = dynamic(() => import('../../../../components/Post'))
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

const PostPage = (props) => {
  const { hubPost } = props
  return (
    <>
      <Head>
        <title>{`${hubPost.hub.json.displayName}: ${hubPost.post.postContent.json.title}"`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on ${hub.metadata.displayName}.  Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on ${hub.metadata.displayName}`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on ${hub.metadata.displayName}.  Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on ${hub?.metadata.displayName}`}
        />
        <meta name="twitter:description" content={metadata?.description} />

        <meta name="twitter:image" content={metadata?.image} />
        <meta name="og:image" content={metadata?.image} />
      </Head>
      <Post hubPubkey={hubPost.hubId} postPubkey={hubPost.release.postId} />
    </>
  )
}

PostPage.getInitialProps = async (context) => {
  const response = getHubPostFromIndexer(context.query.hubPostPubkey)

  return {
    hubPost: response.hubPost,
  }
}

export default PostPage
