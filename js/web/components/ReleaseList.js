import * as anchor from "@project-serum/anchor";
import React, { useEffect, useState, useContext } from "react";
import { Helmet } from "react-helmet";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useWallet } from "@solana/wallet-adapter-react";
import { Box, Typography } from "@mui/material";
import ReleaseListTable from "./ReleaseListTable";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
import Link from "next/link";

const { NinaClient } = ninaCommon.utils;
const { ReleaseContext, NinaContext } = ninaCommon.contexts;

const usdcMint = NinaClient.ids().mints.usdc;
const USDC_MINT_ID = new anchor.web3.PublicKey(usdcMint);

const ReleaseList = () => {
  const {
    getReleasesRecent,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    collectRoyaltyForRelease,
    releaseState,
  } = useContext(ReleaseContext);

  const wallet = useWallet();
  const { collection } = useContext(NinaContext);
  const [userPublishedReleases, setUserPublishedReleases] = useState([]);
  const [sales, setSales] = useState(0);
  const [editionTotal, setEditionTotal] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [exchanges, setExchanges] = useState(0);
  const [exchangeSales, setExchangeSales] = useState(0);

  useEffect(() => {
    getReleasesRecent();
  }, []);

  useEffect(() => {
    if (wallet?.connected && !userPublishedReleases) {
      getReleasesPublishedByUser(wallet.publicKey);
    }
  }, [wallet?.connected]);

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser());
    }
  }, [releaseState, collection]);

  useEffect(() => {
    let salesCount = 0;
    let editionCount = 0;
    let revenueCount = 0;
    let exchangeCount = 0;
    let exchangeSalesCount = 0;
    userPublishedReleases.forEach((release) => {
      salesCount += release.tokenData.saleCounter.toNumber();
      editionCount += release.tokenData.totalSupply.toNumber();
      revenueCount += release.tokenData.totalCollected.toNumber();
      exchangeCount += release.tokenData.exchangeSaleCounter.toNumber();
      exchangeSalesCount += release.tokenData.exchangeSaleTotal.toNumber();
    });
    setSales(salesCount);
    setEditionTotal(editionCount);
    setRevenue(revenueCount);
    setExchanges(exchangeCount);
    setExchangeSales(exchangeSalesCount);
  }, [userPublishedReleases]);

  return (
    <>
      <Helmet>
        <title>{`Nina: Your Releases(${
          userPublishedReleases?.length || 0
        })`}</title>
        <meta name="description" content={"Your releases on Nina."} />
      </Helmet>
      <ScrollablePageWrapper>
        <UserReleaseWrapper>
          {wallet?.connected && userPublishedReleases?.length > 0 && (
            <>
              {sales > 0 && (
                <ReleaseStats>
                  <Typography variant="h1" align="left" gutterBottom>
                    You have released{" "}
                    <span>{userPublishedReleases.length}</span>{" "}
                    {userPublishedReleases.length === 1 ? "track" : "tracks"}{" "}
                    and sold
                    <span> {sales}</span> of <span>{editionTotal} </span>{" "}
                    available editions for a total of{" "}
                    <span>
                      {NinaClient.nativeToUiString(revenue, USDC_MINT_ID)}
                    </span>
                    .{`  You've`} had <span>{exchanges}</span>{" "}
                    {exchanges === 1 ? "sale" : "sales"} on the secondary market
                    for a total of{" "}
                    <span>
                      {NinaClient.nativeToUiString(exchangeSales, USDC_MINT_ID)}
                    </span>
                    .
                  </Typography>

                  <Link href="/faq">How do I withdraw my USDC?</Link>
                </ReleaseStats>
              )}
              <ReleaseListTable
                releases={userPublishedReleases}
                tableType="userPublished"
                collectRoyaltyForRelease={collectRoyaltyForRelease}
                key="releases"
              />
            </>
          )}
          {wallet?.connected && userPublishedReleases?.length === 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{ paddingBottom: "10px" }}
              >{`You haven't published any music yet.`}</Typography>
              <Link href="/upload" passHref>
                <Typography>Start Uploading</Typography>
              </Link>
            </Box>
          )}
        </UserReleaseWrapper>
      </ScrollablePageWrapper>
    </>
  );
};

const ReleaseStats = styled(Box)(({ theme }) => ({
  width: "680px",
  margin: "auto",
  paddingBottom: "94px",
  "& span": {
    color: theme.palette.blue,
  },
}));

const UserReleaseWrapper = styled(Box)(({ theme }) => ({
  textAlign: "left",
  "& a": {
    color: theme.palette.blue,
  },
}));

export default ReleaseList;
