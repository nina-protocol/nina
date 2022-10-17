import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  createElement,
  Fragment,
} from "react";
import dynamic from "next/dynamic";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/router";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";

import Typography from "@mui/material/Typography";
const PostRelease = dynamic(() => import("./PostRelease"));

const Post = ({ postDataSsr, hub, postPubkey, hubPostPubkey, hubPubkey }) => {
  const router = useRouter();
  const [referenceReleasePubkey, setReferenceReleasePubkey] = useState();
  const [referenceReleaseMetadata, setReferenceReleaseMetadata] = useState();
  const [postContent, setPostContent] = useState(Fragment);

  const [postData, setPostData] = useState(postDataSsr || null);

  const [metadata, setMetadata] = useState();

  const { postState } = useContext(Nina.Context);
  const { getHub, hubState, hubContentState, getHubPost } =
    useContext(Hub.Context);
  const { getRelease, releaseState } = useContext(Release.Context);

  useEffect(() => {
    getHub(hubPubkey);
  }, [hubPubkey]);
  
  useEffect(() => {
    if (hubPostPubkey && !postState[postPubkey]) {
      getHubPost(hubPostPubkey, hubPubkey);
    }
  }, [hubPostPubkey]);

  useEffect(() => {
    if (postState[postPubkey] && !postData) {
      setPostData(postState[postPubkey]);
    }
  }, [postState, postPubkey]);

  useEffect(() => {
    if (hubContentState && postPubkey) {
      const metadata = Object.values(hubContentState).find(
        (content) => content.post === postPubkey
      );
      setMetadata(metadata);
      if (metadata?.referenceContent && !referenceReleasePubkey) {
        setReferenceReleasePubkey(metadata.referenceContent);
        getRelease(metadata.referenceContent);
      }
    }
  }, [hubContentState, postPubkey]);

  useEffect(() => {
    if (releaseState.metadata[referenceReleasePubkey]) {
      setReferenceReleaseMetadata(
        releaseState.metadata[referenceReleasePubkey]
      );
    }
  }, [releaseState, referenceReleasePubkey]);

  useEffect(() => {
    if (postState[postPubkey]?.data.bodyHtml) {
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
          JSON.parse(postState[postPubkey].data.bodyHtml).replaceAll(
            "<p><br></p>",
            "<br>"
          )
        )
        .then((file) => {
          setPostContent(file.result);
        });
    }
  }, [postState[postPubkey]]);

  const formattedDate = (date) => {
    return new Date(
      typeof date === "number" ? date * 1000 : date
    ).toLocaleDateString();
  };
  return (
    <>
      <Grid
        item
        md={6}
        xs={12}
        sx={{
          margin: { md: "0px auto auto", xs: "100px 0 15px" },
          padding: "0 15px",
          overflowX: "hidden",
        }}
      >
        {referenceReleaseMetadata && (
          <PostRelease
            metadata={referenceReleaseMetadata}
            releasePubkey={referenceReleasePubkey}
            hubPubkey={hubPubkey}
          />
        )}
      </Grid>
      <Grid
        item
        md={6}
        xs={12}
        sx={{
          margin: { md: "0px auto auto", xs: "0px" },
          padding: {
            md: "0 15px",
            xs: `${referenceReleaseMetadata ? "15px" : "75px"} 15px`,
          },
        }}
      >
        {postData && (
          <PostWrapper>
            <Typography variant="h4" fontWeight="600" align="left">
              {postData.data.title}
            </Typography>
            <Typography align="left">{postContent}</Typography>
            <Divider sx={{mt: 1}}/>
            <Typography align="left" sx={{ marginTop: "20px" }}>
              Published by:{" "}
              <a
                href={`https://ninaprotocol.com/collection/${postData.publisher}`}
                target="_blank"
                rel="noreferrer"
              >
                {postData.publisher}
              </a>{" "}
              at{" "}
              <a
                href={`https://explorer.solana.com/account/${postData.publicKey}`}
                target="_blank"
                rel="noreferrer"
              >
                {formattedDate(postData.datetime)}
              </a>
            </Typography>
          </PostWrapper>
        )}
      </Grid>
    </>
  );
};

const PostWrapper = styled(Box)(({ theme }) => ({
  paddingBottom: "40px",
  maxHeight: "86vh",
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [theme.breakpoints.down("md")]: {
    maxHeight: "unset",
    paddingBottom: "100px",
  },
}));

export default Post;
