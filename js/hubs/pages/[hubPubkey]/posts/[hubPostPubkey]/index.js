import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import axios from "axios";
import NotFound from "../../../../components/NotFound";

const Post = dynamic(() => import("../../../../components/Post"));

const PostPage = (props) => {
  const { metadata, post, hub, postPubkey, hubPubkey } = props;

  if (!post) {
    return (
      <NotFound hub={hub} />
    )
  }
  return (
    <>
      <Head>
        <title>{`${hub?.json.displayName}: ${post?.postContent.json.title}`}</title>
        <meta name="og:type" content="website" />
        {metadata && (
          <>
          <meta
            name="description"
            content={`${metadata?.json.name || post.postContent.json.title}: ${metadata?.json.description || post.postContent.json.body} \n Published on ${hub?.json.displayName}.  Powered by Nina.`}
          />
          <meta
            name="og:title"
            content={`${metadata?.json.name} on ${hub.json.displayName}`}
          />
          <meta
            name="og:description"
            content={`${metadata?.json.name ? metadata?.json.name + ':' : ''} ${metadata?.json.description || post.postContent.json.body} \n Published on ${hub?.json.displayName}.  Powered by Nina.`}
          />
          </>
        )}

        {!metadata && (
          <>
            <meta
              name="description"
              content={`${post.postContent.json.title} on ${hub?.json.displayName}`}
            />
            <meta
              name="og:title"
              content={`${post.postContent.json.title} on ${hub?.json.displayName}`}
            />
            <meta
              name="og:description"
              content={`${post.postContent.json.title} on ${hub?.json.displayName}`}
            />
          </>
        )}

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

export default PostPage;

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          hubPubkey: 'placeholder',
          hubPostPubkey: "placeholder"
        }
      }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL;
  const hubPostPubkey = context.params.hubPostPubkey;
  let indexerPath = indexerUrl + `/hubPosts/${hubPostPubkey}`;

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
      metadata = data.metadata || null;
      hubPost = data.hubPost;
      post = hubPost.post;
      postPubkey = hubPost.postId;
      hub = hubPost.hub;
      hubPubkey = hubPost.hubId;
    }
    return {
      props: {
        metadata,
        hubPostPubkey,
        postPubkey,
        post,
        hub,
        hubPubkey
      },
      revalidate: 10
    };
  } catch (error) {
    console.warn(error);
    try {
      indexerPath = indexerUrl + `/hubs/${context.params.hubPubkey}`
      const result = await axios.get(indexerPath);
      const data = result.data
  
      if (data.hub) {
        return {
          props: {
            hub: data.hub
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return {props: {}};
};

