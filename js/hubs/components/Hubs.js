import React, { useContext, useEffect, useMemo, useState } from "react";
import Hub from "@nina-protocol/nina-sdk/esm/Hub";
import Nina from "@nina-protocol/nina-sdk/esm/Nina";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Head from "next/head";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";


import HubSlider from "./HubSlider";
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from "../styles/theme/lightThemeOptions.js";

const Hubs = () => {
  const { getHubsForUser, hubState, filterHubsForUser, getHubs, filterFeaturedHubs } =
    useContext(Hub.Context);
  const { npcAmountHeld } = useContext(Nina.Context);
  const [hubs, setHubs] = useState()
  const router = useRouter();
  const wallet = useWallet();

  useEffect(() => {
    if (!hubs) {
      getHubs(true)
    }
  }, [])

  useEffect(() => {
    if ((!hubs || hubs.length === 0) & Object.keys(hubState).length > 0) {
      setHubs(filterFeaturedHubs())
    }
  }, [hubState])

  useEffect(() => {
    if (wallet.connected) {
      getHubsForUser(wallet.publicKey.toBase58());
    }
  }, [wallet.connected]);

  const userHubs = useMemo(() => {
    if (wallet.connected) {
      return filterHubsForUser(wallet.publicKey.toBase58());
    }
    return [];
  }, [hubState, wallet.connected]);

  return (
    <>
      <Head>

        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
          media="print"
          // onLoad="this.media='all'"

       />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
          media="print"
          // onLoad="this.media='all'"
        />
      </Head>
      <HubsContainer>
        <Box
          sx={{
            padding: { md: "0px 40px 40px 40px !important", xs: "0px" },
          }}
        >
          {!wallet?.connected && (
            <>
              <BlueTypography
                variant="h1"
                align="left"
                sx={{ padding: { md: "0 165px 40px", xs: "0px 0px 10px" } }}
              >
                <Link href="/all">Hubs </Link>
                are a new way to publish, share, and discuss music.
              </BlueTypography>
              <BlueTypography
                variant="h1"
                align="left"
                sx={{ padding: { md: "0 165px 40px", xs: "30px 0px" } }}
              >
                <Link
                  href="https://docs.google.com/forms/d/e/1FAIpQLScSdwCMqUz6VGqhkO6xdfUxu1pzdZEdsGoXL9TGDYIGa9t2ig/viewform"
                  target="_blank"
                  rel="noreferrer"
                  passHref
                >
                  Apply
                </Link>{" "}
                for a Hub or connect your wallet to get started.                
                <Link
                  href="https://www.notion.so/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612#c7abd525851545a199e06ecd14a16a15"
                  target="_blank"
                  rel="noreferrer"
                  passHref
                >
                  Learn More
                </Link>
                .
              </BlueTypography>

              <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' }}}>
                <Typography
                  variant="body1"
                  align="left"
                  className={classes.sectionHeader}
                >
                  <Link href='/all' sx={{textDecoration: 'none'}}>
                    Featured Hubs
                  </Link>
                </Typography>
              </Box>
              
              <HubSlider hubs={hubs} />

              <Box sx={{mt: '40px'}}>
              <BlueTypography variant="h1">
                <Link href="/all">
                  Start Exploring.
                </Link>
              </BlueTypography>
              </Box>

            </>
          )}
          {wallet.connected && (
            <>
              {npcAmountHeld === 0 && userHubs && userHubs?.length === 0 && (
                <DashboardContent>
                  <BlueTypography
                    variant="h1"
                    align="left"
                    sx={{ padding: { md: "0 165px 40px", xs: "30px 0px" } }}
                  >
                    You do not have any credits to create a Hub. Please{` `}
                    <Link
                      href="https://docs.google.com/forms/d/e/1FAIpQLScSdwCMqUz6VGqhkO6xdfUxu1pzdZEdsGoXL9TGDYIGa9t2ig/viewform"
                      target="_blank"
                      rel="noreferrer"
                      passHref
                    >
                      apply
                    </Link>{" "}
                    here to get started.
                  </BlueTypography>
                  <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
                    <Typography
                      variant="body1"
                      align="left"
                      className={classes.sectionHeader}
                    >
                      <Link href='/all' sx={{textDecoration: 'none'}}>
                        Featured Hubs
                      </Link>
                    </Typography>
                  </Box>
                  <HubSlider hubs={hubs} />

                <Box sx={{mt: '40px'}} display="flex">
                  <BlueTypography variant="h1" margin="auto">
                    <Link href="/all">
                      Start Exploring.
                    </Link>
                  </BlueTypography>
                </Box>

                </DashboardContent>
              )}
              {userHubs?.length > 0 && (
                <DashboardWrapper
                  md={9}
                  columnSpacing={2}
                  columnGap={2}
                  height="100% !important"
                >
                  {npcAmountHeld === 0 && (
                    <DashboardContent item md={6}>
                      <StyledLink
                        href="https://docs.google.com/forms/d/e/1FAIpQLScSdwCMqUz6VGqhkO6xdfUxu1pzdZEdsGoXL9TGDYIGa9t2ig/viewform"
                        target="_blank"
                        rel="noreferrer"
                        passHref
                      >
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                        >
                          Apply For More Hubs
                        </Button>
                      </StyledLink>
                      <StyledLink
                      href="/all">
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                          sx={{mt: '15px'}}
                        >
                          Browse All Hubs
                        </Button>
                      </StyledLink>
                    </DashboardContent>
                  )}
                  {npcAmountHeld > 0 && (
                    <DashboardContent item md={6}>
                      <StyledLink
                        href="/create"
                      >
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                        >
                          Create a Hub
                        </Button>
                      </StyledLink>
                      <StyledLink
                        href="/all"
                      >
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                          sx={{mt: '15px'}}
                        >
                          Browse All Hubs
                        </Button>
                      </StyledLink>
                    </DashboardContent>
                  )}
                  <DashboardContent item md={6}>
                    <>
                      <DashboardHeader style={{ fontWeight: 600 }}>
                        You have {userHubs.length} {userHubs.length > 1 ? 'Hubs' : 'Hub'}
                      </DashboardHeader>
                      <ul style={{ height: "500px", overflowY: "scroll" }}>
                        {userHubs.map((hub) => {
                          return (
                            <DashboardEntry key={hub.id}>
                              <Link href={`/${hub.handle}`}>
                                {hub?.json?.displayName}
                              </Link>
                            </DashboardEntry>
                          );
                        })}
                      </ul>
                    </>
                  </DashboardContent>
                </DashboardWrapper>
              )}
            </>
          )}
        </Box>
      </HubsContainer>
    </>
  );
};

const PREFIX = "hubs";

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
};

const BlueTypography = styled(Typography)(({ theme }) => ({
  "& a": {
    color: theme.palette.blue,
    textDecoration: "none",
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));
const HubsContainer = styled("div")(({ theme }) => ({
  width: "1010px",
  margin: "auto",
  overflowX: "visible",
  [theme.breakpoints.down("md")]: {
    width: "80vw",
    overflowY: 'hidden',
    marginTop: '6vh',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: "700 !important",
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: "uppercase !important",
    position: "relative",
    "& .MuiTypography-root": {
      textTransform: "uppercase !important",
      fontWeight: "700 !important",
    },
    "& .MuiButton-root": {
      position: "absolute",
      top: "-10px",
    },
  },
}));

export default Hubs;
