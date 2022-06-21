import React, { useContext, useEffect, useMemo, useState } from "react";
import nina from "@nina-protocol/nina-sdk";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import ScrollablePageWrapper from "./ScrollablePageWrapper";
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

const { HubContext, NinaContext } = nina.contexts;

const Hubs = () => {
  const { getHubsForUser, hubState, filterHubsForUser, getHubs, filterFeaturedHubs } =
    useContext(HubContext);
  const { npcAmountHeld } = useContext(NinaContext);
  const [hubs, setHubs] = useState()
  const router = useRouter();
  const wallet = useWallet();

  useEffect(() => {
    getHubs(true)
  }, [])

  useEffect(() => {
    if (wallet.connected) {
      getHubsForUser(wallet.publicKey.toBase58());
    }
  }, [wallet.connected]);

  const userHubs = useMemo(() => {
    if (wallet.connected) {
      return filterHubsForUser(wallet.publicKey.toBase58());
    }
    setHubs(filterFeaturedHubs())
    return undefined;
  }, [hubState, wallet.connected]);

  return (
    <ScrollablePageWrapper>
      <HubsContainer>
        <Box
          sx={{
            padding: { md: "0px 40px 40px 40px !important", xs: "30px 0px" },
          }}
        >
          {!wallet?.connected && (
            <>
              <BlueTypography
                variant="h1"
                align="left"
                sx={{ padding: { md: "0 165px 40px", xs: "30px 0px" } }}
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
                for a Hub or connect your wallet to get started.                <Link
                  href="https://www.notion.so/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612#c7abd525851545a199e06ecd14a16a15"
                  target="_blank"
                  rel="noreferrer"
                  passHref
                >
                  Learn More
                </Link>
                .
              </BlueTypography>
              <Box sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}>
                <Typography
                  variant="body1"
                  align="left"
                  className={classes.sectionHeader}
                >
                  Featured Hubs:
                </Typography>
              </Box>
              <HubSlider hubs={hubs} />
            </>
          )}
          {wallet.connected && (
            <>
              {npcAmountHeld === 0 && userHubs && userHubs?.length === 0 && (
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
                    </DashboardContent>
                  )}
                  {npcAmountHeld > 0 && (
                    <DashboardContent item md={6}>
                      <StyledLink>
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                          onClick={() => router.push("/create")}
                        >
                          Create a Hub
                        </Button>
                      </StyledLink>
                    </DashboardContent>
                  )}
                  <DashboardContent item md={6}>
                    <>
                      <DashboardHeader style={{ fontWeight: 600 }}>
                        You have {userHubs.length} Hubs
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
    </ScrollablePageWrapper>
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
    marginBottom: "100px",
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
