import React, { useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import * as anchor from '@project-serum/anchor'
import axios from 'axios'
const Post = dynamic(() => import('../../../../components/Post'))
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

const PostPage = (props) => {
  const { post, hub, postPubkey, hubPubkey } = props
  return (
    <>
      {/* <Head>
        <title>{`${hub?.metadata.displayName}: ${metadata?.properties.artist} - "${metadata?.properties.title}"`}</title>
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
      </Head> */}
      <Post postDataSsr={post} postPubkey={postPubkey} hub={hub} hubPubkey={hubPubkey} />
    </>
  )
}

PostPage.getInitialProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL
  const hubPostPubkey = context.query.hubPostPubkey
  const indexerPath = indexerUrl + `hubPosts/${hubPostPubkey}`
  const result = await axios.get(indexerPath)
  const data = result.data

  let hubPost;
  let postPubkey;
  let post;
  let hub;
  let hubPubkey;
  
  if (data) {
    console.log('data :>> ', data);
    console.log('data.hubPost :>> ', data.hubPost);
    console.log('data.hubPost.hub :>> ', data.hubPost.hub);
     hubPost = data.hubPost
     post = hubPost.post
     postPubkey = hubPost.postId
     hub = hubPost.hub
     hubPubkey = hubPost.hubId
  }
  // let metadata = context.query.metadata
  // let hub = context.query.hub
  // let referenceData
  // console.log('postPubkey ::> ', postPubkey)
  // console.log('metadata, hub ::> ', metadata, hub)
    // try {

    // } catch (error) {
    //   console.warn(error)
    // }
  

  return {
    hubPostPubkey,
    postPubkey,
    post,
    hub,
    hubPubkey
  }
}

export default PostPage
