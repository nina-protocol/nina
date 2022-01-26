import React, { useContext, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import Button from "@mui/material/Button";
import ninaCommon from "nina-common";
import RecentlyPublished from "./RecentlyPublished";
import Link from "next/link";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
const { AudioPlayerContext, ReleaseContext } = ninaCommon.contexts;

const HomePage = () => {
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(ReleaseContext);
  const { resetQueueWithPlaylist } = useContext(AudioPlayerContext)
  const [releasesRecent, setReleasesRecent] = useState({});

  useEffect(() => {
    getReleasesRecent();
  }, []);

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent());
  }, [releasesRecentState]);

  return (
    <ScrollablePageWrapper>
      <HomePageContainer overflowX="visible">
        <Typography
          variant="h1"
          align="left"
          sx={{ padding: { md: "0 165px 140px", xs: "30px 0px" } }}
        >
          Nina is a new way to <Link href="/upload">publish</Link>,{" "}
          <Link href="https://radio.nina.market">stream</Link>, and{" "}
          <Link href="/releases">purchase</Link> music. We build tools for
          artists + fans to create their context.{" "}
        </Typography>

        <Box sx={{ padding: { md: "0 40px 140px 40px", xs: "30px 0px" } }}>
          <Box
            sx={{ display: "flex", paddingLeft: { md: "30px", xs: "0" } }}
            className={classes.sectionHeader}
          >
            <Typography variant="body1" align="left">
              Highlights 
              <span> 
                <Button
                  onClick={() => resetQueueWithPlaylist(releasesRecent.highlights.map(release => release.releasePubkey))}
                >
                  <PlayCircleOutlineOutlinedIcon sx={{ color: "black" }} />
                </Button>
              </span>
            </Typography>
          </Box>
          <RecentlyPublished releases={releasesRecent.highlights} />
        </Box>

        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          How it works
        </Typography>
        <Typography
          variant="h1"
          align="left"
          sx={{ paddingBottom: { md: "140px", xs: "30px" } }}
        >
          Music on Nina can be publicly streamed by anyone, while also being released in the form of a digital edition as scarce or ubiquitous as the artist desires. You can use Nina to simply host your music, to sell digital editions, or to build out a patronage mechanism by providing unique content + experiences to paying supporters.
          <br /><br />More questions? Read our <Link href="/faq">FAQ</Link>.
        </Typography>

        <Box sx={{ padding: { md: "0 40px 140px 40px", xs: "30px 0px" } }}>
          <Box
            sx={{ display: "flex", paddingLeft: { md: "30px", xs: "0" } }}
            className={classes.sectionHeader}
          >
            <Typography variant="body1" align="left">
              New Releases
              <span> 
                <Button
                  onClick={() => resetQueueWithPlaylist(releasesRecent.published.map(release => release.releasePubkey))}
                >
                  <PlayCircleOutlineOutlinedIcon sx={{ color: "black" }} />
                </Button>
              </span>
            </Typography>

          </Box>
          <RecentlyPublished releases={releasesRecent.published} />
        </Box>

        <Typography
          variant="body1"
          align="left"
          className={classes.sectionHeader}
        >
          Our product is the Nina protocol, not your music.
        </Typography>
        <Typography
          variant="h1"
          align="left"
          sx={{ paddingBottom: { md: "140px", xs: "30px" } }}
        >
          Artists receive 100% of their sales. The only fee is a one-time payment (on average ~$4/release) that covers the storage and transaction costs to the Solana and Arweave networks that Nina is built on. Nina does not take a cut.
        </Typography>
      </HomePageContainer>
    </ScrollablePageWrapper>
  );
};

const PREFIX = "homePage";

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
};

const HomePageContainer = styled("div")(({ theme }) => ({
  width: "1010px",
  margin: "auto",
  overflowX: "visible",
  [theme.breakpoints.down("md")]: {
    width: "80vw",
    marginBottom: "100px",
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: "700 !important",
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: "uppercase !important",
    "& .MuiTypography-root": {
      textTransform: "uppercase !important",
      fontWeight: "700 !important",
    },
  },
  "& a": {
    color: theme.palette.blue,
  },
}));

const AllReleasesLink = styled(Typography)(({ theme }) => ({
  marginLeft: "30px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export default HomePage;
