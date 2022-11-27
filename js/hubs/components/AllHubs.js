import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
import Head from "next/head";
import debounce from "lodash.debounce";
import { isMobile } from "react-device-detect";
import HubTileView from "./HubTileView";

const AllHubs = ({ loading }) => {
  const { getHubs, hubState, filterHubsAll } = useContext(Hub.Context);
  const [pendingFetch, setPendingFetch] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      getHubs();
    }
  }, [loading]);

  const hubs = useMemo(() => {
    if (Object.values(hubState).length > 0) {
      setPendingFetch(false);
    }
    return Object.values(hubState);
  }, [hubState]);

  const handleScroll = () => {
    if (!loading) {
      const bottom =
        scrollRef.current.getBoundingClientRect().bottom - 250 <=
        window.innerHeight;
      if (bottom && !pendingFetch && totalCount !== hubs.length && !loading) {
        setPendingFetch(true);
        getHubs();
      }
    }
  };

  return (
    <>
      <Head>
        <title>{`Nina Hubs: All`}</title>
        <meta name="description" content={"Nina Hubs: All"} />
      </Head>
      <ScrollablePageWrapper
        onScroll={debounce(() => handleScroll(), 500)}
        sx={{ overflowY: "scroll" }}
      >
        <AllHubsWrapper ref={scrollRef}>
          <HubTileView
            hubs={
              hubs.length > 0
                ? isMobile
                  ? filterHubsAll().reverse()
                  : filterHubsAll()
                : []
            }
          />
        </AllHubsWrapper>
      </ScrollablePageWrapper>
    </>
  );
};

const AllHubsWrapper = styled(Box)(({ theme }) => ({
  maxWidth: "960px",
  height: "auto",
  minHeight: "75vh",
  margin: "0 15px 0 auto",
  position: "relative",
  "& a": {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down("md")]: {
    padding: "0px 30px",
    overflowX: "auto",
    minHeight: "80vh",
    margin: "0 auto",
  },
}));

export default AllHubs;
