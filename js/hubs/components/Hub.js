import React, {useState, useContext, useEffect, useMemo, createElement, Fragment} from "react";
import dynamic from "next/dynamic";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina"
import Release from "@nina-protocol/nina-internal-sdk/esm/Release"
import {styled} from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dots from "./Dots";

import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";
const ContentTileView = dynamic(() => import("./ContentTileView"));

const HubComponent = ({hubPubkey}) => {
  const {
    hubState,
    hubCollaboratorsState,
    initialLoad,
    getHub,
    filterHubCollaboratorsForHub,
    filterHubContentForHub,
    hubContentFetched,
    hubContentState
  } = useContext(Hub.Context);
  const {postState} = useContext(Nina.Context);
  const {releaseState} = useContext(Release.Context);
  const [contentData, setContentData] = useState({
    content: [],
    contentTypes: []
  })
  const [hubReleases, setHubReleases] = useState([])
  const [hubPosts, setHubPosts] = useState([])
  
  useEffect(() => {
    getHub(hubPubkey);
    setContentData({
      content: [],
      contentTypes: []
    })
    setHubReleases([])
    setHubPosts([])
  }, [hubPubkey]);

  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey]);
  useEffect(() => {
    const [releases, posts] = filterHubContentForHub(hubPubkey)
    setHubReleases(releases)
    setHubPosts(posts)
  }, [hubContentState]);
  const [description, setDescription] = useState();
  const hubCollaborators = useMemo(
    () => filterHubCollaboratorsForHub(hubPubkey) || [],
    [hubCollaboratorsState, hubPubkey]
  );

  useEffect(() => {
  }, [hubContentFetched])

  useEffect(() => {
    const contentArray = [];
    const types = []
    const hubContent = [...hubReleases, ...hubPosts];
    hubContent.forEach((hubContentData) => {
      if (hubContentData.hub === hubPubkey) {        
        if (
          hubContentData.contentType === "NinaReleaseV1" &&
          releaseState.metadata[hubContentData.release] &&
          hubContentData.visible
        ) {
          const hubReleaseIsReference =
            hubContent.filter(
              (c) => c.referenceHubContent === hubContentData.release && c.visible
            ).length > 0;
          if (!hubReleaseIsReference) {
            hubContentData = {
              ...hubContentData,
              ...releaseState.metadata[hubContentData.release],
            };
            contentArray.push(hubContentData);
          }
          if (hubContentData.publishedThroughHub || releaseState.tokenData[hubContentData.release]?.authority.toBase58() === hubData?.authority) {
            types.push('Releases')
          } else {
            types.push('Reposts')
          }
        } else if (
          hubContentData.contentType === "Post" &&
          postState[hubContentData.post] &&
          hubContentData.visible
        ) {
          hubContentData = {
            ...hubContentData,
            ...postState[hubContentData.post],
            hubPostPublicKey: hubContentData.publicKey,
          };
          if (hubContentData.referenceHubContent !== null) {
            hubContentData.releaseMetadata =
              releaseState.metadata[hubContentData.referenceHubContent];
            hubContentData.contentType = "PostWithRelease";
          }
          types.push('Text Posts')
          contentArray.push(hubContentData);
        }
      }
    });
    const uniqueTypes = [...new Set(types)]
    setContentData(
      {      
        content: contentArray.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        ),
        contentTypes: uniqueTypes
      }
    );
  }, [hubReleases, hubPosts]);

  useEffect(() => {
    if (hubData?.json.description.includes('<p>')) {
      unified()
        .use(rehypeParse, {fragment: true})
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
          JSON.parse(hubData.json.description).replaceAll(
            "<p><br></p>",
            "<br>"
          )
        )
        .then((file) => {
          setDescription(file.result);
        });
    } else {
      setDescription(hubData?.json.description)
    }
  }, [hubData?.json.description]);

  if (!hubState[hubPubkey]?.json) {
    return null;
  }
  if (!hubData) {
    return (
      <Box margin="auto">
        <Dots size="80px" />
      </Box>
    );
  }
  return (
    <>
      <Grid item md={4} sx={{padding: {md: "15px", xs: "40px 15px 15px"}}}>
          {hubData.json.description.length > 0 && (
            <DescriptionWrapper
              sx={{padding: {md: "15px", xs: "40px 0 0"}, width: '100%'}}
            >
              <Typography align="left" sx={{color: "text.primary"}}>
                {description}
              </Typography>
            </DescriptionWrapper>
          )}
      </Grid>

      <ContentViewWrapper item md={8} height="100%">
        {!hubContentFetched.has(hubPubkey) && (
          <Box mt="29%">
            <Dots size="80px" />
          </Box>
        )}
        {hubContentFetched.has(hubPubkey) && contentData.content?.length > 0 && (
          <ContentTileView
            contentData={contentData}
            hubPubkey={hubPubkey}
            hubHandle={hubData.handle}
          />
        )}
        {hubContentFetched.has(hubPubkey) && contentData.content?.length === 0 && (
          <Typography>Nothing has been published to this Hub yet</Typography>
        )}
      </ContentViewWrapper>
    </>
  );
};


const ContentViewWrapper = styled(Grid)(({theme}) => ({
  [theme.breakpoints.down("md")]: {
    width: "100%",
    padding: "15px",
  },
}));

const DescriptionWrapper = styled(Grid)(({theme}) => ({
  padding: " 0px 15px",
  maxHeight: "68vh",
  overflowX: "hidden",
  overflowY: "scroll",
  'h1' :{
    lineHeight: '32px',
  },
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [theme.breakpoints.down("md")]: {
    maxHeight: "unset",
    padding: "100px 15px 50px",
  },
  'p, a': {
    padding: '0 0 8px',
    margin: '0'
  },
  'a': {
    textDecoration: 'underline'
  }
}));

export default HubComponent;