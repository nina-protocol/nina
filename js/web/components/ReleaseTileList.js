import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import Image from "./Image";
import { useRouter } from "next/router";
import { Typography, Box } from "@mui/material";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import Button from "@mui/material/Button";

const { AudioPlayerContext } = ninaCommon.contexts;

const ReleaseTileList = (props) => {
  const { releases } = props;
  const { updateTxid, addTrackToQueue } = useContext(AudioPlayerContext);

  const router = useRouter();

  const handleClick = (releasePubkey) => {
    router.push(`/${releasePubkey}`);
  };

  return (
    <Box>
      <TileGrid>
        {releases.map((release, i) => {
          return (
            <Tile key={i}>
              <HoverCard
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(release.releasePubkey);
                }}
              >
                <CardCta
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(release.releasePubkey);
                  }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTxid(
                        release.metadata.properties.files[0].uri,
                        release.releasePubkey,
                        true
                      );
                    }}
                  >
                    <PlayCircleOutlineOutlinedIcon sx={{ color: "white" }} />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addTrackToQueue(release.releasePubkey);
                    }}
                  >
                    <ControlPointIcon sx={{ color: "white" }} />
                  </Button>
                </CardCta>
                <Image
                  width={100}
                  height={100}
                  layout="responsive"
                  containerStyles={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    zIndex: "1",
                  }}
                  src={release.metadata.image}
                />
              </HoverCard>
              <Box sx={{ padding: "10px 0 0" }}>
                <Typography gutterBottom>
                  {" "}
                  {release.tokenData.remainingSupply.toNumber() > 0
                    ? `${release.tokenData.remainingSupply.toNumber()} / ${release.tokenData.totalSupply.toNumber()} remaining`
                    : "Sold Out"}
                </Typography>
                <ReleaseName>{release.metadata.name}</ReleaseName>
              </Box>
            </Tile>
          );
        })}
      </TileGrid>
    </Box>
  );
};

const TileGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridColumnGap: "30px",
  gridRowGap: "15px",
  maxWidth: "960px",
  margin: "auto",
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
    paddingBottom: "120px",
  },
}));

const Tile = styled(Box)(({ theme }) => ({
  textAlign: "left",
  maxWidth: "100%",
  [theme.breakpoints.down("md")]: {
    maxWidth: "37vw",
  },
}));

const HoverCard = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: "300px",
  [theme.breakpoints.down("md")]: {
    minHeight: "144px",
  },
}));

const CardCta = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.overlay,
  zIndex: "2",
  opacity: "0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "&:hover": {
    opacity: "1",
    cursor: "pointer",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
    zIndex: "-1",
  },
}));

const ReleaseName = styled(Typography)(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

export default ReleaseTileList;
