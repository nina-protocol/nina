import React, { useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import * as anchor from '@project-serum/anchor'
import axios from 'axios'
const Post = dynamic(() => import('../../../components/Post'))
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

const PostPage = (props) => {
  const { post, hub, postPubkey } = props
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
      <Post postDataSsr={post?.metadata} postPubkey={postPubkey} />
    </>
  )
}

PostPage.getInitialProps = async (context) => {
  const postPubkey = context.query.postPubkey
  let metadata = context.query.metadata
  let hub = context.query.hub
  let referenceData
  console.log('postPubkey ::> ', postPubkey)
  console.log('metadata, hub ::> ', metadata, hub)
  if (metadata && hub) {
    metadata = JSON.parse(metadata)
    hub = JSON.parse(hub)
  } else {
    try {
      const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(process.env.REACT_APP_CLUSTER_URL)
      )
      const program = await anchor.Program.at(
        process.env.REACT_PROGRAM_ID,
        provider
      )
      console.log('before')
      const post = await program.account.post.fetch(
        new anchor.web3.PublicKey(postPubkey)
      )
      post.metadata = (
        await axios.get(
          new TextDecoder()
            .decode(new Uint8Array(post.uri))
            .replace(/\u0000/g, '')
        )
      ).data

      console.log('post.metadata :>> ', post.metadata)

      if (post.metadata.reference) {
        //Should be switched to not use arweave reference
        try {
          referenceData = await program.account.release.fetch(
            new anchor.web3.PublicKey(post.metadata.reference)
          )
        } catch (error) {
          referenceData = await program.account.post.fetch(
            new anchor.web3.PublicKey(post.metadata.reference)
          )
        } finally {
          console.log('reference data not fetch')
        }
      }

      hub = await program.account.hub.fetch(
        new anchor.web3.PublicKey(process.env.REACT_HUB_PUBLIC_KEY)
      )
      hub.metadata = (
        await axios.get(
          new TextDecoder()
            .decode(new Uint8Array(hub.uri))
            .replace(/\u0000/g, '')
        )
      ).data
      hub.handle = new TextDecoder()
        .decode(new Uint8Array(hub.name))
        .replace(/\u0000/g, '')
    } catch (error) {
      console.warn(error)
    }
  }

  return {
    postPubkey,
    metadata,
    hub,
  }
}

export default PostPage
