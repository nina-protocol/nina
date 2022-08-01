import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import {HubContext} from "@nina-protocol/nina-sdk/esm/Hub";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
import Head from "next/head";
import debounce from 'lodash.debounce'
import HubTileView from "./HubTileView";

const Hubs = () => {
  const { getHubs, hubState, hubsCount } = useContext(HubContext);
  const [pendingFetch, setPendingFetch] = useState(false)
  const [totalCount, setTotalCount] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    getHubs();
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, []);

  const hubs = useMemo(() => {
    if (Object.values(hubState).length > 0) {
      setPendingFetch(false)
    }
    return Object.values(hubState);
  }, [hubState]);


  useEffect(() => {
    setTotalCount(hubsCount)
  }, [hubsCount])

  const handleScroll = () => {
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
    if (
      bottom &&
      !pendingFetch &&
      totalCount !== hubs.length
    ) {
      setPendingFetch(true)
      getHubs()
    }
  }
  return (
    <>
      <Head>
        <title>{`Nina Hubs: All`}</title>
        <meta name="description" content={'Nina Hubs: All'} />
      </Head>
      <ScrollablePageWrapper onScroll={debounce(() => handleScroll(), 500)} sx={{overflowY: "scroll"}}>
        <AllHubsWrapper ref={scrollRef}>
          <HubTileView hubs={hubs} />
        </AllHubsWrapper>
      </ScrollablePageWrapper>
    </>
  );
};

const AllHubsWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
  height: 'auto',
  minHeight: '75vh',
  margin: '0 15px 0 auto',
  position: 'relative',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '80vh',
    margin: '0 auto',
  },
}));


export default Hubs;
