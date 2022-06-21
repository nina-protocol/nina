import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import nina from "@nina-protocol/nina-sdk";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import Dots from "./Dots";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
import Image from "next/image";
import Head from "next/head";
import debounce from 'lodash.debounce'
import HubTileView from "./HubTileView";

const { HubContext } = nina.contexts;

const Hubs = () => {
  const { getHubs, hubState, hubsCount } = useContext(HubContext);
  const wallet = useWallet();
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
    console.log('HANDLE SCORLL')
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
      console.log(totalCount, hubs)
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
  margin: '0 auto',
  position: 'relative',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '80vh',
  },
}))

const HubGrid = styled(Grid)(({ theme }) => ({
  paddingBottom: "200px",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [theme.breakpoints.down("md")]: {
    paddingBottom: "100px",
  },
}));

const HubTile = styled(Grid)(({ theme }) => ({
  padding: "15px 15px 15px",
  position: "relative",
  [theme.breakpoints.down("md")]: {
    padding: "10px",
  },
}));

const HubLink = styled(Link)(({ theme }) => ({
  height: "100%",
  width: "100%",
}));

const HubName = styled(Typography)(({ theme }) => ({
  paddingTop: "5px",
  fontWeight: "500",
}));

export default Hubs;
