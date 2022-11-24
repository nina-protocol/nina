import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import NinaSdk from "@nina-protocol/js-sdk";
import NotFound from "../../../../components/NotFound";
import { initSdkIfNeeded } from "@nina-protocol/nina-internal-sdk/src/utils/sdkInit";
import Dots from '../../../../components/Dots'
const Post = dynamic(() => import("../../../../components/Post"));

const PostPage = (props) => {
  const { post, hub, loading } = props;

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
        <meta name="twitter:image" content={hub.data.image} />
        <meta name="og:image" content={hub.data.image} />
      </Head>
      {loading ? (
        <Dots size="80px" />
      ) : (
        <Post
        postDataSsr={post}
        postPubkey={post.publicKey}
        hub={hub}
        hubPubkey={hub.publicKey}
      />
      )}
    </>
  );
};

export default PostPage;

export const getStaticPaths = async () => {
  await initSdkIfNeeded(true);
  const paths = [];
  const { hubs } = await NinaSdk.Hub.fetchAll({ limit: 1000 });
  for await (const hub of hubs) {
    const { posts } = await NinaSdk.Hub.fetchPosts(hub.publicKey);
    posts.forEach((post) => {
      paths.push({
        params: {
          hubPubkey: hub.publicKey,
          hubPostPubkey: post.hubPostPublicKey,
        },
      });
      paths.push({
        params: { hubPubkey: hub.handle, hubPostPubkey: post.hubPostPublicKey },
      });
    });
  }
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  try {
    await initSdkIfNeeded(true);
    const { hub, post } = await NinaSdk.Hub.fetchHubPost(
      context.params.hubPubkey,
      context.params.hubPostPubkey
    );
    return {
      props: {
        post,
        hub,
      },
      revalidate: 1000,
    };
  } catch (error) {
    console.warn(error);
    try {
      const hub = await NinaSdk.Hub.fetchHub(context.params.hubPubkey);

      if (hub) {
        return {
          props: {
            hub,
          },
        };
      }
    } catch (error) {
      console.warn(error);
    }
  }
  return { props: {} };
};
