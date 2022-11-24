import React, {
  useState,
  useContext,
  useEffect,
  createElement,
  Fragment,
} from "react";
import dynamic from "next/dynamic";
import Audio from "@nina-protocol/nina-internal-sdk/esm/Audio";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import { imageManager } from "@nina-protocol/nina-internal-sdk/esm/utils";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Typography from "@mui/material/Typography";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { useWallet } from "@solana/wallet-adapter-react";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";
import Head from "next/head";
const { getImageFromCDN, loader } = imageManager;

const Royalty = dynamic(() => import("./Royalty"));
const Button = dynamic(() => import("@mui/material/Button"));
const ReleasePurchase = dynamic(() => import("./ReleasePurchase"));
const AddToHubModal = dynamic(() => import("./AddToHubModal"));

const ReleaseComponent = ({ metadataSsr, releasePubkey, hubPubkey, hubSsr }) => {
  const wallet = useWallet();

  const { updateTrack, track, isPlaying, setInitialized, audioPlayerRef } =
    useContext(Audio.Context);
  const { releaseState, getRelease } = useContext(Release.Context);
  const { getHub, hubState, getHubsForUser, filterHubsForUser } = useContext(
    Hub.Context
  );

  const [metadata, setMetadata] = useState(metadataSsr || null);
  const [description, setDescription] = useState();
  const [userHubs, setUserHubs] = useState();
  const [userIsRecipient, setUserIsRecipient] = useState(false);

  useEffect(() => {
    if (hubPubkey && !hubState[hubPubkey]) {
      getHub(hubPubkey);
    }
  }, []);

  useEffect(() => {
    if (releasePubkey) {
      getRelease(releasePubkey);
    }
  }, [releasePubkey]);

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      setMetadata(releaseState.metadata[releasePubkey]);
    }
  }, [releaseState, metadata, releasePubkey]);

  useEffect(() => {
    const fetchHubs = async () => {
      const hubs = await getHubsForUser(wallet.publicKey.toBase58());
      setUserHubs(hubs);
    };
    if (wallet.connected && hubState && !userHubs) {
      fetchHubs();
    }
  }, [wallet?.connected, hubState]);

  useEffect(() => {
    if (metadata?.descriptionHtml?.includes("<p>")) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ["nofollow", "noreferrer"],
        })
        .process(
          JSON.parse(metadata.descriptionHtml).replaceAll("<p><br></p>", "<br>")
        )
        .then((file) => {
          setDescription(file.result);
        });
    } else {
      setDescription(metadata?.description);
    }
  }, [metadata?.description]);

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]?.revenueShareRecipients) {
      releaseState.tokenData[releasePubkey]?.revenueShareRecipients.forEach(
        (recipient) => {
          if (
            wallet?.connected &&
            recipient.recipientAuthority === wallet?.publicKey.toBase58()
          ) {
            setUserIsRecipient(true);
          }
        }
      );
    }
  }, [releaseState.tokenData[releasePubkey], wallet?.connected]);

  return (
    <>
      <Head>
        <title>{`${metadataSsr?.properties.artist} - "${metadataSsr?.properties.title}"`}</title>
        <meta
          name="description"
          content={`${metadataSsr?.properties.artist} - "${metadataSsr?.properties.title}": ${metadataSsr?.description} \n  Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`${metadataSsr?.properties.artist} - "${metadataSsr?.properties.title}"`}
        />
        <meta
          name="og:description"
          content={`${metadataSsr?.properties.artist} - "${metadataSsr?.properties.title}": ${metadataSsr?.description} \n Published on ${hubSsr?.data.displayName} \nPowered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${metadataSsr?.properties.artist} - "${metadataSsr?.properties.title}" on ${hubSsr?.data.displayName}`}
        />
        <meta name="twitter:description" content={metadataSsr?.description} />

        <meta name="twitter:image" content={metadataSsr?.image} />
        <meta name="og:image" content={metadataSsr?.image} />
      </Head>
      <StyledGrid
        item
        md={6}
        xs={12}
        sx={{
          margin: { md: "0px auto auto", xs: "0px" },
          padding: { md: "0 15px", xs: "75px 15px" },
        }}
      >
        {metadata && metadata.image && (
          <>
            <MobileImageWrapper>
              <Image
                src={getImageFromCDN(
                  metadata.image,
                  1200,
                  new Date(Date.parse(metadata.properties.date))
                )}
                loader={loader}
                layout="responsive"
                objectFit="contain"
                objectPosition={"center"}
                height={100}
                width={100}
                alt={metadata.description || "album art"}
              />
            </MobileImageWrapper>

            <CtaWrapper>
              <Typography
                variant="h3"
                align="left"
                sx={{ color: "text.primary", mr: 1 }}
              >
                {metadata.properties.artist} - {metadata.properties.title}
              </Typography>

              <Box
                display="flex"
                sx={{ mt: "15px", mb: { md: "15px", xs: "0px" } }}
              >
                <PlayButton
                  sx={{ height: "22px", width: "28px", m: 0, paddingLeft: 0 }}
                  onClickCapture={(e) => {
                    e.stopPropagation();
                    setInitialized(true);
                    if (!audioPlayerRef.current.src) {
                      audioPlayerRef.current.load();
                    }
                    updateTrack(
                      releasePubkey,
                      !(isPlaying && track.releasePubkey === releasePubkey),
                      hubPubkey
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
              </Box>
            </CtaWrapper>

            <Box
              sx={{
                marginTop: { md: "0px", xs: "30px" },
                marginBottom: "15px",
              }}
            >
              <ReleasePurchase
                releasePubkey={releasePubkey}
                metadata={metadata}
                hubPubkey={hubPubkey}
              />
              {userIsRecipient && (
                <Royalty
                  release={releaseState.tokenData[releasePubkey]}
                  releasePubkey={releasePubkey}
                />
              )}
            </Box>

            <StyledDescription align="left">{description}</StyledDescription>
          </>
        )}
      </StyledGrid>

      <DesktopImageGridItem item md={6}>
        {metadata && metadata.image && (
          <ImageContainer>
            <Image
              src={getImageFromCDN(
                metadata.image,
                1200,
                new Date(Date.parse(metadata.properties.date))
              )}
              loader={loader}
              layout="responsive"
              objectFit="contain"
              height="100"
              width="100"
              objectPosition={"right bottom"}
              alt={metadata.description || "album art"}
            />
          </ImageContainer>
        )}
      </DesktopImageGridItem>
    </>
  );
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    "&:-webkit-scrollbar": {
      display: "none !important",
    },
  },
}));

const PlayButton = styled(Button)(({ theme }) => ({
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
  fontSize: "18px !important",
  lineHeight: "20.7px !important",
  marginTop: "15px",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [theme.breakpoints.up("md")]: {
    maxHeight: "275px",
    overflowY: "scroll",
    height: "275px",
  },
  [theme.breakpoints.down("md")]: {
    paddingBottom: "40px",
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

const CtaWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("md")]: {
    marginTop: "15px",
  },
}));

export default ReleaseComponent;
