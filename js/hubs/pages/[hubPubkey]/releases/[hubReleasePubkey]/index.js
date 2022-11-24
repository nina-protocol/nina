import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import NotFound from "../../../../components/NotFound";
import NinaSdk from "@nina-protocol/js-sdk";
import { initSdkIfNeeded } from "@nina-protocol/nina-internal-sdk/src/utils/sdkInit";
const Release = dynamic(() => import("../../../../components/Release"));

const ReleasePage = (props) => {
  const { metadata, hub, releasePubkey, hubPubkey } = props;
  console.log('metadata', metadata);
  if (!metadata) {
    return <NotFound hub={hub} />;
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
  await initSdkIfNeeded(true);
  const paths = [];
  const { hubs } = await NinaSdk.Hub.fetchAll({ limit: 1000 });
  for await (const hub of hubs) {
    const { releases } = await NinaSdk.Hub.fetchReleases(hub.publicKey);
    releases.forEach((release) => {
      paths.push({
        params: {
          hubPubkey: hub.publicKey,
          hubReleasePubkey: release.hubReleasePublicKey,
        },
      });
      paths.push({
        params: {
          hubPubkey: hub.handle,
          hubReleasePubkey: release.hubReleasePublicKey,
        },
      });
    });
  }
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async (context) => {
  try {
    if (
      context.params.hubPubkey &&
      context.params.hubReleasePubkey !== "undefined"
    ) {
      await initSdkIfNeeded(true);
      const { hub, release } = await NinaSdk.Hub.fetchHubRelease(
        context.params.hubPubkey,
        context.params.hubReleasePubkey
      );
      return {
        props: {
          releasePubkey: release.publicKey,
          metadata: release.metadata,
          hubPubkey: hub.publicKey,
          hub,
        },
        revalidate: 1000,
      };
    }
  } catch (error) {
    console.warn(error);
    try {
      await initSdkIfNeeded();
      const hub = await NinaSdk.Hub.fetch(context.params.hubPubkey);
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
    return { props: {} };
  }
};
