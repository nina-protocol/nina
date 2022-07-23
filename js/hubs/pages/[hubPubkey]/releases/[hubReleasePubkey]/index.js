import React, { useContext } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import * as anchor from "@project-serum/anchor";
import axios from "axios";
const Release = dynamic(() => import("../../../../components/Release"));
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const ReleasePage = (props) => {
  const { metadata, hub, releasePubkey, hubPubkey } = props;
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
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}": ${metadata?.description} \n Published on ${hub?.json.displayName} \nPowered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadata?.properties.artist} - "${metadata?.properties.title}" on ${hub?.json.displayName}`}
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

export const getServerSideProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL;
  const hubReleasePubkey = context.query.hubReleasePubkey;
  const indexerPath = indexerUrl + `/hubReleases/${hubReleasePubkey}`;


  let hubRelease;
  let release;
  let hub;
  let releasePubkey;
  let metadata;
  let hubPubkey;
  try {
    const result = await axios.get(indexerPath);
    const data = result.data;
    if (data.hubRelease) {
      hubRelease = data.hubRelease;
      release = hubRelease.release;
      metadata = release.metadataAccount.json;
      releasePubkey = hubRelease.releaseId;
      hub = hubRelease.hub;
      hubPubkey = hubRelease.hubId;
    }
    return {
      props: {
        releasePubkey,
        metadata,
        hubPubkey,
        hub
      }
    } 
  } catch (error) {
    console.warn(error);
  }
  return {
    releasePubkey,
    metadata,
    hubPubkey: hubRelease?.hubId,
    hub
  };
};

