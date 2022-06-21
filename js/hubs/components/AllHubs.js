import React, { useContext, useEffect, useMemo } from "react";
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

const { HubContext } = nina.contexts;

const Hubs = () => {
  const { getHubs, hubState } = useContext(HubContext);
  const wallet = useWallet();

  useEffect(() => {
    getHubs();
  }, []);

  const hubs = useMemo(() => {
    return Object.values(hubState);
  }, [hubState]);

  if (hubs.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "250px",
        }}
      >
        <Dots size="80px" />
      </Box>
    );
  }

  return (
    <HubsContainer overflowX="visible">
      <Box sx={{ paddingLeft: { md: "15px", xs: "0" } }}>
        <Typography
          variant="h2"
          align="left"
          sx={{ fontWeight: "700 !important" }}
        >
          Hubs
        </Typography>
      </Box>
      <HubGrid container>
        {hubs?.map((hub, i) => {
          const imageUrl = hub?.json?.image;
          return (
            <HubTile item md={4} xs={6} key={i}>
              {imageUrl && (
                <HubLink href={`/${hub.handle}`}>
                  <a>
                    <Image
                      src={imageUrl}
                      height={100}
                      width={100}
                      layout="responsive"
                      priority={true}
                      unoptimized={true}
                      loading="eager"
                    />
                  </a>
                </HubLink>
              )}
              <HubName variant="h4">{hub.json.displayName}</HubName>
            </HubTile>
          );
        })}
      </HubGrid>
    </HubsContainer>
  );
};

const HubsContainer = styled("div")(({ theme }) => ({
  width: "1010px",
  margin: "auto",
  overflowX: "visible",
  [theme.breakpoints.down("md")]: {
    width: "90vw",
    margin: "100px 0",
  },
}));

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
