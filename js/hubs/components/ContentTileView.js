import React, { useContext, useState, useMemo, useEffect } from "react";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import Image from "next/image";
import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import Button from "@mui/material/Button";
import Link from "next/link";
import AutorenewTwoToneIcon from "@mui/icons-material/AutorenewTwoTone";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const { AudioPlayerContext, HubContext, ReleaseContext } = nina.contexts;

const ContentTileView = ({ content, hubPubkey, hubHandle, contentTypes }) => {
  const { updateTrack } = useContext(AudioPlayerContext);
  const { hubState } = useContext(HubContext);
  const { releaseState } = useContext(ReleaseContext);
  const [columnCount, setColumnCount] = useState(3);
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey]);
  const router = useRouter();

  const [displayType, setDisplayType] = useState("all");
  const [filteredContent, setFilteredContent] = useState(content);

  useEffect(() => {
    let filtered;
    switch (displayType) {
      case "all":
        setFilteredContent(content);
        break;
      case "releases":
        filtered = content.filter((item) => {
          return (
            item.contentType === "NinaReleaseV1" &&
            item.publishedThroughHub === true
          );
        });
        setFilteredContent(filtered);
        break;

      case "reposts":
        filtered = content.filter((item) => {
          return (
            item.contentType === "NinaReleaseV1" &&
            item.publishedThroughHub === false
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
  }, [displayType]);

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
    <Box position="relative">
      {/* {contentTypes.length > 2 && (
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
      )} */}
      <TileGrid columnCount={columnCount}>
        {filteredContent.map((item, i) => {
          return (
            <React.Fragment key={i}>
              {item?.contentType === "NinaReleaseV1" && (
                <Tile className={"tile"} key={i}>
                  <HoverCard
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
                          updateTrack(item.release, true);
                        }}
                        disableRipple
                      >
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: "text.primary" }}
                        />
                      </Button>

                      <ContentName
                        sx={{ color: "text.primary", padding: "0 15px" }}
                      >
                        {item.name.substring(0, 100)}
                      </ContentName>
                    </CardCta>
                    {item.image && (
                      <Image
                        width={100}
                        height={100}
                        layout="responsive"
                        src={item?.image}
                        release={item}
                        priority={true}
                        unoptimized={true}
                        loading="eager"
                      />
                    )}
                  </HoverCard>
                  {!item.publishedThroughHub && (
                    <StyledAutorenewIcon fontSize="small" />
                  )}
                </Tile>
              )}

              {item.contentType === "Post" && (
                <PostTile className={"tile"} key={i}>
                  <PostInfo sx={{ padding: "10px 0 0" }}>
                    <PostTitle
                      variant="h2"
                      sx={{ color: "text.primary", textTransform: "uppercase" }}
                    >
                      {item.postContent.json.title.substring(0, 100)}
                      {item.postContent.json.title.length > 100 ? "..." : ""}
                    </PostTitle>
                    <Typography sx={{ color: "text.primary" }}>
                      published: {formattedDate(item.createdAt)}
                    </Typography>
                  </PostInfo>
                  <HoverCard>
                    <Link
                      href={`/${hubHandle}/posts/${item.hubPostPublicKey}`}
                      passHref
                    >
                      <CardCta>
                        <PostLink>View Post</PostLink>
                      </CardCta>
                    </Link>
                  </HoverCard>
                </PostTile>
              )}
              {item.contentType === "PostWithRelease" && (
                <Tile className={"tile"} key={i}>
                  <HoverCard
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
                        width={100}
                        height={100}
                        layout="responsive"
                        src={item.releaseMetadata?.image}
                        release={item.referenceContent}
                        priority={true}
                        unoptimized={true}
                        loading="eager"
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

const TileGrid = styled(Box)(({ theme, columnCount }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
  gridColumnGap: "30px",
  gridRowGap: "30px",
  maxWidth: "960px",
  margin: "auto",
  maxHeight: "92vh",
  overflow: "scroll",
  marginTop: "1px",
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
  paddingBottom: "calc(100% - 4px)",
  border: `2px solid ${theme.palette.transparent}`,
  "&:hover": {
    border: `2px solid ${theme.palette.text.primary}`,
  },
  [theme.breakpoints.down("md")]: {
    border: `none`,
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
  paddingBottom: "calc(100% - 4px)",
  boxSizing: "border-box",
  [theme.breakpoints.down("md")]: {
    maxHeight: "272px",
  },
}));

const HoverCard = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "0",
  paddingBottom: "100%",
  [theme.breakpoints.down("md")]: {
    minHeight: "144px",
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
  padding: "10px 0 0 10px",
  position: "absolute",
  top: "0",
  left: "5px",
  height: "98%",
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
  position: "absolute",
  top: "auto",
  bottom: "5px",
  right: "5px",
  background: "rgba(255,255,255,0.5)",
  borderRadius: "50%",
  [theme.breakpoints.down("md")]: {
    bottom: "35px",
    right: "3px",
  },
}));

const StyledButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  position: "absolute",
  top: "-56px",
  right: "0",
  "& .MuiButtonBase-root": {
    border: "none",
    textTransform: "capitalize",
    "&:hover": {
      backgroundColor: theme.palette.transparent,
    },
  },
  "& .Mui-selected ": {
    // backgroundColor: 'none !important',
    backgroundColor: `${theme.palette.transparent} !important`,
    textDecortation: "underline !important",
  },
  [theme.breakpoints.down("md")]: {
    position: "unset",
  },
}));


export default ContentTileView;
