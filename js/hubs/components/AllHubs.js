import React, { useContext, useEffect, useMemo } from "react";
import nina from "@nina-protocol/nina-sdk";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";

import HubSlider from "./HubSlider";

const { HubContext, NinaContext } = nina.contexts;

const Hubs = () => {
  const { getHubs, hubState } = useContext(HubContext);
  const wallet = useWallet();

  useEffect(() => {
    getHubs();
  }, []);

  const hubs = useMemo(() => {
    return Object.values(hubState);
  }, [hubState]);

  return (
    <HubsContainer overflowX="visible">
      <Box
        sx={{
          padding: { md: "40px 40px 140px 40px !important", xs: "30px 0px" },
        }}
      >
        <Box sx={{ paddingLeft: { md: "30px", xs: "0" } }}>
          <Typography
            variant="body1"
            align="left"
            className={classes.sectionHeader}
          >
            Hubs
          </Typography>
        </Box>
        <HubSlider hubs={hubs} />
      </Box>
    </HubsContainer>
  );
};

const PREFIX = "hubs";

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
};

const HubsContainer = styled("div")(({ theme }) => ({
  width: "1010px",
  margin: "auto",
  overflowX: "visible",
  "& .MuiBox-root": {
    paddingTop: "40px !important",
  },
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
