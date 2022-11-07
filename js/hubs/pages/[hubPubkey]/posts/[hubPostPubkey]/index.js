import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import NinaSdk from "@nina-protocol/js-sdk";
import NotFound from "../../../../components/NotFound";

const Post = dynamic(() => import("../../../../components/Post"));

const PostPage = (props) => {
  const { post, hub } = props;

  if (!post) {
    return <NotFound hub={hub} />;
  }
  return (
    <>
      <Head>
        <title>{`${hub?.data.displayName}: ${post?.data.title}`}</title>
        <meta name="og:type" content="website" />

        <>
          <meta
            name="description"
            content={`${post.data.title} on ${hub?.data.displayName}`}
          />
          <meta
            name="og:title"
            content={`${post.data.title} on ${hub?.data.displayName}`}
          />
          <meta
            name="og:description"
            content={`${post.data.title} on ${hub?.data.displayName}`}
          />
        </>

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${post.data.title} on ${hub?.data.displayName}`}
        />
        <meta name="twitter:description" content={post.data.body} />
        <meta
          name="twitter:image"
          content={hub.data.image}
        />
        <meta
          name="og:image"
          content={hub.data.image}
        />
      </Head>
      <Post
        postDataSsr={post}
        postPubkey={post.publicKey}
        hub={hub}
        hubPubkey={hub.publicKey}
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
          hubPubkey: "placeholder",
          hubPostPubkey: "placeholder",
        },
      },
    ],
    fallback: "blocking",
  };
};

export const getStaticProps = async (context) => {
  try {
    if (!NinaSdk.client.program) {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID
      )      
    }
    const { hub, post } = await NinaSdk.Hub.fetchHubPost(context.params.hubPubkey, context.params.hubPostPubkey)
    return {
      props: {
        post,
        hub,
      },
      revalidate: 10,
    };
  } catch (error) {
    console.warn(error);
    try {
      const hub = await NinaSdk.Hub.fetchHub(context.params.hubPubkey)

      if (hub) {
        return {
          props: {
            hub,
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
  return { props: {} };
};
