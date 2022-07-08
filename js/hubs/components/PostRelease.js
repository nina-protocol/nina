import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import nina from "@nina-protocol/nina-sdk";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import Image from "next/image";
import Typography from "@mui/material/Typography";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { useWallet } from "@solana/wallet-adapter-react";

const ReleasePurchase = dynamic(() => import("./ReleasePurchase"));
const AddToHubModal = dynamic(() => import("./AddToHubModal"));

const { HubContext, ReleaseContext, AudioPlayerContext } = nina.contexts;

const PostRelease = ({ metadata, releasePubkey, hubPubkey }) => {
  const router = useRouter();
  const wallet = useWallet();

  const { updateTrack, track, isPlaying, setInitialized, audioPlayerRef } = useContext(AudioPlayerContext);
  const { releaseState, getRelease } = useContext(ReleaseContext);
  const {
    getHub,
    hubState,
    getHubsForUser,
    filterHubsForUser,
    hubCollaboratorsState,
  } = useContext(HubContext);

  const [userHubs, setUserHubs] = useState();

  // const {current: releasePubkey} = useRef(router.query.releasePubkey)

  // const [metadata, setMetadata] = useState(
  //   metadata || null
  // )

  useEffect(() => {
    if (!hubState[hubPubkey]) {
      getHub(hubPubkey);
    }
  }, []);

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey);
    }
  }, [releasePubkey]);

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && !metadata) {
      setMetadata(releaseState.metadata[releasePubkey]);
    }
  }, [releaseState, metadata, releasePubkey]);

  useEffect(() => {
    if (wallet.connected && hubState[hubPubkey] && !userHubs) {
      getHubsForUser(wallet.publicKey.toBase58());
    }
  }, [wallet.connect, hubState[hubPubkey]]);

  useEffect(() => {
    if (wallet.connected && hubState) {
      setUserHubs(filterHubsForUser(wallet.publicKey.toBase58()));
    }
  }, [hubState]);

  return (
    <>
      <DesktopImageGridItem item md={6}>
        {metadata && (
          <ImageContainer>
            <Image
              src={metadata?.image}
              layout="responsive"
              objectFit="contain"
              height="100"
              width="100"
              objectPosition={"right bottom"}
              alt={metadata.description || "album art"}
              unoptimized={true}
            />
          </ImageContainer>
        )}
      </DesktopImageGridItem>
      <Grid
        item
        md={6}
        xs={12}
        sx={{
          padding: "0px",
        }}
      >
        {metadata && (
          <>
            <MobileImageWrapper>
              <Image
                src={metadata?.image}
                layout="responsive"
                objectFit="contain"
                objectPosition={"center"}
                height={100}
                width={100}
                alt={metadata.description || "album art"}
                unoptimized={true}
              />
            </MobileImageWrapper>
            <CtaWrapper>
              <Typography
                variant="h3"
                align="left"
                sx={{ color: "text.primary", whiteSpace: "nowrap", mr: 1 }}
              >
                {metadata.properties.artist} - {metadata.properties.title}
              </Typography>

              <PlayButton
                sx={{ height: "22px", width: "28px", m: 0 }}
                onClickCapture={(e) => {
                  e.stopPropagation();
                  setInitialized(true)
                  if (!audioPlayerRef.current.src) {
                    audioPlayerRef.current.load()
                  }
                  updateTrack(
                    releasePubkey,
                    !(isPlaying && track.releasePubkey === releasePubkey)
                  );
                }}
              >
                {isPlaying && track.releasePubkey === releasePubkey ? (
                  <PauseCircleOutlineIcon />
                ) : (
                  <PlayCircleOutlineIcon />
                )}
              </PlayButton>

              {releasePubkey && metadata && (
                <AddToHubModal
                  userHubs={userHubs}
                  releasePubkey={releasePubkey}
                  metadata={metadata}
                  hubPubkey={hubPubkey}
                />
              )}
            </CtaWrapper>
            {/* <StyledDescription variant="h4" align="left">{metadata.description}</StyledDescription> */}
          </>
        )}
        <ReleasePurchase
          releasePubkey={releasePubkey}
          metadata={metadata}
          inPost={true}
          hubPubkey={hubPubkey}
        />
      </Grid>
    </>
  );
};

const PlayButton = styled(Button)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  padding: "0 10px",
  color: `${theme.palette.text.primary} !important`,
  ":disabled": {
    color: theme.palette.text.primary + "a0",
  },
  "&:hover": {
    opacity: "50%",
    backgroundColor: `${theme.palette.transparent} !important`,
  },
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
  overflowWrap: "anywhere",
  [theme.breakpoints.up("md")]: {
    maxHeight: "225px",
    overflowY: "scroll",
  },
}));

const DesktopImageGridItem = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const MobileImageWrapper = styled(Grid)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
    padding: "30px 0 0",
  },
}));

const ImageContainer = styled(Box)(() => ({
  width: "100%",
}));

const CtaWrapper = styled(Box)(() => ({
  display: "flex",
  marginTop: "15px",
}));

export default PostRelease;
