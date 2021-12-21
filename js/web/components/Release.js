import React, { useState, useContext, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import ninaCommon from "nina-common";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import NinaBox from "./NinaBox";
import ReleaseCard from "./ReleaseCard";
import ReleasePurchase from "./ReleasePurchase";
import { useRouter } from "next/router";
import Head from "next/head";

const { Exchange } = ninaCommon.components;
const { ExchangeContext, ReleaseContext } = ninaCommon.contexts;

const Release = ({metadataSsr}) => {
  const router = useRouter();
  const releasePubkey = router.query.releasePubkey;

  const wallet = useWallet();
  const {
    releaseState,
    getRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
  } = useContext(ReleaseContext);
  const { getExchangeHistoryForRelease, exchangeState } =
    useContext(ExchangeContext);
  const [track, setTrack] = useState(null);
  const [relatedReleases, setRelatedReleases] = useState(null);

  const [metadata, setMetadata] = useState(
    metadataSsr || releaseState?.metadata[releasePubkey] || null
  );

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey)
      getRelatedForRelease(releasePubkey);
      getExchangeHistoryForRelease(releasePubkey);
    }
  }, [releasePubkey]);

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      setMetadata(releaseState.metadata[releasePubkey]);
    }
  }, [releaseState?.metadata[releasePubkey]]);

  useEffect(() => {
    setTrack(releaseState.metadata[releasePubkey]);
  }, [releaseState.metadata[releasePubkey]]);

  useEffect(() => {
    setRelatedReleases(filterRelatedForRelease(releasePubkey));
  }, [releaseState]);

  if (metadata && Object.keys(metadata).length === 0) {
    return (
      <div>
        <h1>{`We're still preparing this release for sale, check back soon!`}</h1>
        <Button onClick={() => getRelease(releasePubkey)}>Refresh</Button>
      </div>
    );
  }

  if (!wallet?.connected && router.pathname.includes("releases")) {
    router.push(`/${releasePubkey}`);
  }

  return (
    <>
      {metadata && (
        <Head>
          <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}</title>
          <meta
            name="description"
            content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
          />
          <meta
            property="og:description"
            content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
          />
          <meta property="twitter:card" content={"summary"} />
          <meta
            property="twitter:creator"
            content={metadata?.properties.artist}
          />
          <meta
            property="twitter:title"
            content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
          />
          <meta property="twitter:description" content={metadata.description} />
          <meta name="twitter:image" content={metadata.image} />
        </Head>
      )}
      {metadata && (
        <ReleaseWrapper>
          {!router.pathname.includes("market") && (
            <NinaBox
              columns={"repeat(2, 1fr)"}
              sx={{ backgroundColor: "white" }}
            >
              <ReleaseCard
                metadata={metadata}
                preview={false}
                releasePubkey={releasePubkey}
                track={track}
              />
              <ReleaseCtaWrapper>
                <ReleasePurchase
                  releasePubkey={releasePubkey}
                  metadata={metadata}
                  router={router}
                  relatedReleases={relatedReleases}
                />
              </ReleaseCtaWrapper>
            </NinaBox>
          )}

          {router.pathname.includes("market") && (
            <NinaBox columns={"repeat(1, 1fr)"}>
              <Exchange
                releasePubkey={releasePubkey}
                exchanges={exchangeState.exchanges}
                metadata={metadata}
                track={track}
              />
            </NinaBox>
          )}
        </ReleaseWrapper>
      )}
    </>
  );
};

const ReleaseWrapper = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  [theme.breakpoints.down("md")]: {
    overflowX: "scroll",
    paddingTop: '100px',
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
}));
const ReleaseCtaWrapper = styled(Box)(({ theme }) => ({
  margin: "auto",
  width: "calc(100% - 50px)",
  paddingLeft: "50px",
  [theme.breakpoints.down("md")]: {
    paddingLeft: "0",
    width: "100%",
    marginBottom: "100px",
  },
}));

export default Release;
