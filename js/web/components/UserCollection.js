import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import ninaCommon from "nina-common";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";
import { Typography, Box } from "@mui/material";
import ReleaseListTable from "./ReleaseListTable";
import ReleaseTileList from "./ReleaseTileList";
import ScrollablePageWrapper from "./ScrollablePageWrapper";

const { ReleaseContext, NinaContext } = ninaCommon.contexts;

const ReleaseList = () => {
  const { filterReleasesUserCollection, releaseState } =
    useContext(ReleaseContext);
  const [listView, setListView] = useState(false);

  const wallet = useWallet();
  const { collection, createCollection } = useContext(NinaContext);
  const [userCollectionReleases, setUserCollectionReleases] = useState();

  useEffect(() => {
    createCollection()
  }, [])
  
  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleases(filterReleasesUserCollection());
    }
  }, [releaseState, collection]);

  const handleViewChange = () => {
    setListView(!listView);
  };
  return (
    <>
      <Head>
        <title>{`Nina: Your Collection(${
          userCollectionReleases?.length || 0
        })`}</title>
        <meta name="description" content={"Your collection on Nina."} />
      </Head>
      <ScrollablePageWrapper>
        {wallet?.connected && userCollectionReleases?.length > 0 && (
          <Wrapper>
            <CollectionHeader listView={listView}>
              <Typography variant="body1" fontWeight="700">
                Your Collection
              </Typography>
              <Typography onClick={handleViewChange} sx={{ cursor: "pointer" }}>
                {listView ? "Cover View" : "List View"}
              </Typography>
            </CollectionHeader>

            {listView && (
              <ReleaseListTable
                releases={userCollectionReleases}
                tableType="userCollection"
                key="releases"
              />
            )}
            {!listView && <ReleaseTileList releases={userCollectionReleases} />}
          </Wrapper>
        )}
        {wallet?.connected && userCollectionReleases?.length === 0 && (
          <Typography>Your collection is empty!</Typography>
        )}
      </ScrollablePageWrapper>
    </>
  );
};

const CollectionHeader = styled(Box)(() => ({
  maxWidth: '100%',
  margin: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "15px",
}));

const Wrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
  margin: 'auto',
  [theme.breakpoints.down("md")]: {
    padding: "0px 30px",
    overflowX: "auto",
  },
}));

export default ReleaseList;
