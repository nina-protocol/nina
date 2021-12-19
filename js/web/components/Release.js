import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
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

const Release = ({metadata}) => {
  const router = useRouter();
  const releasePubkey = router.query.releasePubkey;

  const wallet = useWallet();
  const history = useHistory();
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

  useEffect(() => {
    if (releasePubkey) {
      getRelatedForRelease(releasePubkey);
      getExchangeHistoryForRelease(releasePubkey);
    }
  }, [releasePubkey]);

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
    history.push(`/${releasePubkey}`);
  }

  return (
    <>
      <Head>
        <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}</title>
        <meta
          name="description"
          content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
        />
        <meta
          name="og:description"
          content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nina_market_" />
        <meta name="twitter:creator" content="@nina_market_" />
        <meta
          name="twitter:title"
          content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
        />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://f4.bcbits.com/img/a0578492136_16.jpg" />
      </Head>
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
    </>
  );
};

const ReleaseWrapper = styled(Box)(({ theme }) => ({
  height: "100%",
  [theme.breakpoints.down("md")]: {
    overflowX: "scroll",
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
