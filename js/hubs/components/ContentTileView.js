import React, { useContext, useState, useMemo, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Audio from "@nina-protocol/nina-internal-sdk/esm/Audio";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import { imageManager } from "@nina-protocol/nina-internal-sdk/esm/utils";
import Image from "next/image";
import { isMobile } from 'react-device-detect'
import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import Button from "@mui/material/Button";
import AutorenewTwoToneIcon from "@mui/icons-material/AutorenewTwoTone";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
const { getImageFromCDN, loader } = imageManager

const ContentTileView = ({ contentData, hubPubkey, hubHandle }) => {
  const { updateTrack, setInitialized, audioPlayerRef, isPlaying, track } = useContext(Audio.Context);
  const { hubState } = useContext(Hub.Context);
  const { releaseState } = useContext(Release.Context);
  const [columnCount, setColumnCount] = useState(3);
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey]);
  const router = useRouter();

  const [displayType, setDisplayType] = useState("all");
  const [filteredContent, setFilteredContent] = useState([]);
  const content = useMemo(() => contentData.content, [contentData, hubPubkey])
  const contentTypes = useMemo(() => contentData.contentTypes, [contentData, hubPubkey])

  useEffect(() => {
    let filtered;
    switch (displayType) {
      case "all":
        filtered = content.filter((item) => item.hub === hubPubkey)
        console.log('filtered: ', filtered)
        setFilteredContent(filtered);
        break;
      case "releases":
        filtered = content.filter((item) => {
          return (
            item.contentType === "NinaReleaseV1" &&
            (item.publishedThroughHub === true ||
              releaseState.tokenData[item.release]?.authority.toBase58() === hubData?.authority
          ));
        });
        setFilteredContent(filtered);
        break;

      case "reposts":
        filtered = content.filter((item) => {
          return (
            item.contentType === "NinaReleaseV1" &&
            item.publishedThroughHub === false &&
            releaseState.tokenData[item.release]?.authority.toBase58() !== hubData?.authority
          );
        });
        setFilteredContent(filtered);
        break;

      case "textposts":
        filtered = content.filter((item) => {
          return item.contentType === "Post" || item.contentType === "PostWithRelease";
        });
        setFilteredContent(filtered);
        break;

      default:
        break;
    }
  }, [displayType, content]);

  const handleFormat = (event, newDisplayType) => {
    setDisplayType(newDisplayType);
  };

  const handleClick = (hubReleasePubkey, hubPostPubkey = null) => {
    const pathString = hubPostPubkey ? "posts" : "releases";
    router.push(
      {
        pathname: `/${hubHandle}/${pathString}/${
          hubPostPubkey || hubReleasePubkey
        }`,
      },
      `/${hubHandle}/${pathString}/${hubPostPubkey || hubReleasePubkey}`
    );
  };

  const formattedDate = (date) => {
    return new Date(
      typeof date === "number" ? date * 1000 : date
    ).toLocaleDateString();
  };

  return (
    <Box position="relative" sx={{mr: {md: '15px', xs: '0px'}}}>
      {contentTypes.length >= 2 && (
        <StyledButtonGroup
          exclusive
          value={displayType}
          onChange={handleFormat}
          aria-label="text formatting"
        >
          <ToggleButton value="all" aria-label="all" disableRipple>
            All
          </ToggleButton>
          {contentTypes.map((type) => {
            return (
              <ToggleButton
                value={type.toLowerCase().replace(" ", "")}
                aria-label={type}
                disableRipple
                key={type}
              >
                {type}
              </ToggleButton>
            );
          })}
        </StyledButtonGroup>
      )}
      <TileGrid columnCount={columnCount} content={content}>
        {filteredContent?.map((item, i) => {    
          return (
            <React.Fragment key={i}>
              {item?.contentType === "NinaReleaseV1" && (
                <Tile className={"tile"} key={i}>
                  <HoverCard
                    className="hoverBorder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(item.child);
                    }}
                  >
                    <CardCta
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(item.child);
                      }}
                      display="flex"
                      flexDirection={"column"}
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInitialized(true)
                          if (!audioPlayerRef.current.src) {
                            audioPlayerRef.current.load()
                          }
                          updateTrack(item.release, item.release === track.releasePubkey ? !isPlaying : true);
                        }}
                        disableRipple
                      >
                        {isPlaying &&
                          track.releasePubkey === item.release ? (
                            <PauseCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                          ) : (
                            <PlayCircleOutlineOutlinedIcon sx={{ color: "text.primary" }} />
                          )}
                      </Button>
                      <ContentName
                        sx={{ color: "text.primary", padding: "0 15px" }}
                      >
                        {item.name.substring(0, 100)}
                      </ContentName>
                    </CardCta>
                    {item.image && (
                      <Image
                        loader={loader}
                        width={100}
                        height={100}
                        layout="responsive"
                        src={getImageFromCDN(item.image, 400, new Date(releaseState.tokenData[item.release].releaseDatetime.toNumber() * 1000))}
                        release={item}
                        priority={true}
                      />
                    )}
                  </HoverCard>
                  {!item.publishedThroughHub && releaseState.tokenData[item.release]?.authority.toBase58() !== hubData?.authority && (
                    <StyledAutorenewIcon fontSize="small" />
                  )}
                </Tile>
              )}

              {item?.contentType === "Post" && item.postContent && (
                <PostTile
                  className={"tile postTile"}
                  key={i}
                  onClick={() => router.push(`/${hubHandle}/posts/${item.hubPostPublicKey}`)}
                >
                  <PostInfo sx={{ padding: "10px 0 0" }} className={'postInfo'}>
                    <PostTitle
                      variant="h2"
                      sx={{ color: "text.primary", textTransform: "uppercase" }}
                    >
                      {item.postContent?.json.title.substring(0, 100)}
                      {item.postContent?.json.title.length > 100 ? "..." : ""}
                    </PostTitle>
                    <Typography sx={{ color: "text.primary" }}>
                      published: {formattedDate(item.createdAt)}
                    </Typography>
                  </PostInfo>
                  <HoverCard className="hoverCard">
                    <CardCta>
                      <PostLink>View Post</PostLink>
                    </CardCta>
                  </HoverCard>
                </PostTile>
              )}
              {item?.contentType === "PostWithRelease" && (
                <Tile className={"tile"} key={i}>
                  <HoverCard
                  className="hoverBorder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(
                        item.referenceHubContent,
                        item.hubPostPublicKey
                      );
                    }}
                  >
                    <CardCta>
                      <PostInfo sx={{ padding: "10px 0 0" }}>
                        <Typography
                          variant="h2"
                          sx={{
                            color: "text.primary",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.postContent.json.title.substring(0, 100)}
                          {item.postContent.json.title.length > 100 ? "..." : ""}
                        </Typography>
                        <Typography sx={{ color: "text.primary" }}>
                          published: {formattedDate(item.createdAt)}
                        </Typography>
                      </PostInfo>
                      <PostLink>View Post</PostLink>
                    </CardCta>
                    {item.releaseMetadata?.image && (
                      <Image
                        loader={loader}
                        width={100}
                        height={100}
                        layout="fill"
                        src={getImageFromCDN(item.releaseMetadata?.image, isMobile ? 100 : 400)}
                        release={item.referenceContent}
                        priority={true}
                      />
                    )}
                  </HoverCard>
                </Tile>
              )}
            </React.Fragment>
          );
        })}
      </TileGrid>
    </Box>
  );
};

const TileGrid = styled(Box)(({ theme, columnCount, content }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
  gridColumnGap: "28px",
  gridRowGap: "30px",
  maxWidth: "960px",
  margin: "auto",
  maxHeight: "92vh",
  overflow: content.length > 6 ? "scroll" : 'hidden',
  marginTop: "1px",
  paddingRight: '4px',
  paddingBottom: "100px",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  gridAutoRows: "minmax(21vw, 100px)",
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
    maxHeight: "unset",
    overflowX: "hidden",
    overflowY: "hidden",
    gridAutoRows: "minmax(185px, 50vw)",
    gridRowGap: "0px",
    paddingBottom: "120px",
  },
  [theme.breakpoints.up("xl")]: {
    gridAutoRows: "minmax(300px, 100px)",
  },
}));

const Tile = styled(Box)(({ theme }) => ({
  textAlign: "left",
  maxWidth: "100%",
  boxSizing: "border-box",
  maxHeight: "300px",
  width: "100%",
  position: "relative",
  boxSizing: 'content-box',
  '&.postTile': {
    border: `2px solid ${theme.palette.text.primary}`,
  },
  [theme.breakpoints.down("md")]: {
    border: `none`,
    boxSizing: "border-box",
    "&:hover": {
      border: `none`,
    },
  },
}));

const PostTile = styled(Box)(({ theme }) => ({
  textAlign: "left",
  maxWidth: "100%",
  height: "100%",
  border: "2px solid",
  position: "relative",
  width: "100%",
  height: "0",
  paddingBottom: "calc(100% - 0px)",
  boxSizing: "border-box",
  '& .postInfo': {
    height: '98%',
    [theme.breakpoints.down("md")]: {
      height: '95%'
    }
  },
  '& .hoverCard': {
    boxSizing: 'border-box'
  },
  [theme.breakpoints.down("md")]: {
    maxHeight: "272px",
    boxSizing: "border-box",

  },
}));

const HoverCard = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "0",
  paddingBottom: "100%",
  boxSizing: 'content-box',
  border: `2px solid ${theme.palette.transparent}`,
  zIndex: 0,
  [theme.breakpoints.up("md")]: {
    '&.hoverBorder': {
      "&:hover": {
        border: `2px solid ${theme.palette.text.primary}`,
      },
    },
  },
  [theme.breakpoints.down("md")]: {
    boxSizing: 'inherit',
    minHeight: "144px",
    cursor: 'pointer'
  },
}));

const CardCta = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.background.default + "c4",
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

const ContentName = styled("a")(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  cursor: "pointer",
  marginTop: "15px",
}));

const PostLink = styled("a")(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  cursor: "pointer",
  padding: "15px",
}));

const PostInfo = styled(Typography)(({ theme }) => ({
  padding: "10px 0 0 0px",
  position: "absolute",
  top: "0",
  left: "5px",
  height: "94%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    fontSize: "14px !important",
  },
}));

const StyledAutorenewIcon = styled(AutorenewTwoToneIcon)(({ theme }) => ({
  position: "inherit",
  top: "auto",
  bottom: "25px",
  right: "-5px",
  background: "rgba(255,255,255,0.5)",
  borderRadius: "50%",
  [theme.breakpoints.down("md")]: {
    bottom: "30px",
  },
}));

const StyledButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  position: "absolute",
  top: "-56px",
  right: "-6px",
  "& .MuiButtonBase-root": {
    border: "none",
    textTransform: "capitalize",
    "&:hover": {
      backgroundColor: theme.palette.transparent,
    },
    '&:not(.Mui-selected)': {
      color: theme.palette.text.primary,
      opacity: 0.5
    },
  },
  "& .Mui-selected ": {
    backgroundColor: `${theme.palette.transparent} !important`,
    textDecortation: "underline !important",
  },
  [theme.breakpoints.down("md")]: {
    position: "unset",
  },
}));


export default ContentTileView;
