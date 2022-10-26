import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import NotFound from "../../../../components/NotFound";
import NinaSdk from "@nina-protocol/js-sdk";

const Release = dynamic(() => import("../../../../components/Release"));

const ReleasePage = (props) => {
  const { metadata, hub, releasePubkey, hubPubkey } = props;

  if (!metadata) {
    return (
      <NotFound hub={hub}/>
    )
  }
  return (
    <>
      <Head>
        <title>{`${metadata?.properties.artist} - "${metadata?.properties.title}"`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n  Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}"`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on ${hub?.data.displayName} \nPowered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on ${hub?.data.displayName}`}
        />
        <meta name="twitter:description" content={metadata?.description} />

        <meta name="twitter:image" content={metadata?.image} />
        <meta name="og:image" content={metadata?.image} />
      </Head>
      <Release
        metadataSsr={metadata}
        releasePubkey={releasePubkey}
        hubPubkey={hubPubkey}
      />
    </>
  );
};

export default ReleasePage;

export const getStaticPaths = async () => {
  return {
    paths: [
      {params: {
        hubPubkey: 'placeholder',
        hubReleasePubkey: "placeholder"
      }}
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps = async (context) => {
  try {
    if (context.params.hubPubkey && context.params.hubReleasePubkey !== 'undefined') {
      if (!NinaSdk.client.program) {
        await NinaSdk.client.init(
          process.env.NINA_API_ENDPOINT,
          process.env.SOLANA_CLUSTER_URL,
          process.env.NINA_PROGRAM_ID
        )      
      }
      const {hub, release} = await NinaSdk.Hub.fetchHubRelease(context.params.hubPubkey, context.params.hubReleasePubkey);
      return {  
        props: {
          releasePubkey: release.publicKey,
          metadata: release.metadata,
          hubPubkey: hub.publicKey,
          hub,
        },
        revalidate: 10,
      } 
    }
  } catch (error) {
    console.warn(error);
    try {
      if (!NinaSdk.client.program) {
        await NinaSdk.client.init(
          process.env.NINA_API_ENDPOINT,
          process.env.SOLANA_CLUSTER_URL,
          process.env.NINA_PROGRAM_ID
        )      
      }
      const hub = await NinaSdk.Hub.fetch(context.params.hubPubkey);  
      if (hub) {
        return{
          props:{
            hub,
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
    return {props: {}}
  }
};

