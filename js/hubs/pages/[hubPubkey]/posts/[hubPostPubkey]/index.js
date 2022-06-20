import React, { useContext } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import * as anchor from "@project-serum/anchor";
import axios from "axios";
const Post = dynamic(() => import("../../../../components/Post"));
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const PostPage = (props) => {
  const { metadata, post, hub, postPubkey, hubPubkey } = props;
  return (
    <>
      <Head>
        <title>{`${hub?.json.displayName}: ${post.postContent.json.title}`}</title>
        <meta name="og:type" content="website" />
        <meta
          name="description"
          content={`${metadata?.json.name}: ${metadata?.json.description} \n Published on ${hub?.json.displayName}.  Powered by Nina.`}
        />
        <meta
          name="og:title"
          content={`${metadata?.json.name} on ${hub.json.displayName}`}
        />
        <meta
          name="og:description"
          content={`${metadata?.json.name}: ${metadata?.json.description} \n Published on ${hub?.json.displayName}.  Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${post.postContent.json.title} on ${hub?.json.displayName}`}
        />
        <meta name="twitter:description" content={metadata?.description} />
        <meta
          name="twitter:image"
          content={metadata?.json.image || hub.json.image}
        />
        <meta
          name="og:image"
          content={metadata?.json.image || hub.json.image}
        />
      </Head>
      <Post
        postDataSsr={post}
        postPubkey={postPubkey}
        hub={hub}
        hubPubkey={hubPubkey}
      />
    </>
  );
};

PostPage.getInitialProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL;
  const hubPostPubkey = context.query.hubPostPubkey;
  const indexerPath = indexerUrl + `/hubPosts/${hubPostPubkey}`;

  let hubPost;
  let postPubkey;
  let post;
  let hub;
  let hubPubkey;
  let metadata;
  try {
    const result = await axios.get(indexerPath);
    const data = result.data;
    if (data.hubPost) {
      metadata = data.metadata;
      hubPost = data.hubPost;
      post = hubPost.post;
      postPubkey = hubPost.postId;
      hub = hubPost.hub;
      hubPubkey = hubPost.hubId;
    }
    return {
      metadata,
      hubPostPubkey,
      postPubkey,
      post,
      hub,
      hubPubkey: hub.id,
    };
  } catch (error) {
    console.warn(error);
    return {};
  }
};

export default PostPage;
