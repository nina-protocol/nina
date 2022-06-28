import React, {useState, useContext, useEffect, useMemo, createElement, Fragment} from "react";
import dynamic from "next/dynamic";
import nina from "@nina-protocol/nina-sdk";
import {styled} from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dots from "./Dots";
import UserReleasesPrompt from "./UserReleasesPrompt";

import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";


import {useWallet} from "@solana/wallet-adapter-react";
const ContentTileView = dynamic(() => import("./ContentTileView"));
const {HubContext, NinaContext, ReleaseContext} = nina.contexts;

const Hub = ({hubPubkey}) => {
  const {
    hubState,
    hubCollaboratorsState,
    initialLoad,
    getHub,
    filterHubCollaboratorsForHub,
    filterHubContentForHub,
  } = useContext(HubContext);
  const {postState} = useContext(NinaContext);
  const {releaseState} = useContext(ReleaseContext);
  const wallet = useWallet();
  useEffect(() => {
    getHub(hubPubkey);
  }, [hubPubkey]);

  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey]);
  const [hubReleases, hubPosts] = filterHubContentForHub(hubPubkey);
  const [description, setDescription] = useState();
  const hubCollaborators = useMemo(
    () => filterHubCollaboratorsForHub(hubPubkey) || [],
    [hubCollaboratorsState, hubPubkey]
  );

  const contentData = useMemo(() => {
    const contentArray = [];
    const types = []
    const hubContent = [...hubReleases, ...hubPosts];
    hubContent.forEach((hubContentData) => {
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
        if (hubContentData.publishedThroughHub) {
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
    });
    const uniqueTypes = [...new Set(types)]
    return {
      content: contentArray.sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      ),
      contentTypes: uniqueTypes
    };
  }, [hubReleases, hubPosts]);

  useEffect(() => {
    console.log('(hubData?.json.description) :>> ', (hubData?.json.description));
    if (hubData?.json.description.includes('<p>')) {
      console.log('rich description');
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
            ""
          )
        )
        .then((file) => {
          setDescription(file.result);
        });
    } else {
      console.log('normal description');
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
        {/* {wallet?.connected &&
          wallet?.publicKey?.toBase58() === hubData?.authority &&
          hubReleases && (
            <UserReleasesPrompt
              hubPubkey={hubPubkey}
              hubReleases={hubReleases}
            />
          )} */}
          {hubData.json.description.length > 0 && (
            <DescriptionWrapper
              sx={{padding: {md: "15px", xs: "40px 0 0"}}}
            >
              <Typography align="left" sx={{color: "text.primary"}}>
                {description}
              </Typography>
            </DescriptionWrapper>
          )}
      </Grid>

      <ContentViewWrapper item md={8} height="100%">
        {!initialLoad && (
          <Box mt="29%">
            <Dots size="80px" />
          </Box>
        )}
        {contentData.content?.length > 0 && (
          <ContentTileView
            content={contentData.content}
            hubPubkey={hubPubkey}
            hubHandle={hubData.handle}
            contentTypes={contentData.contentTypes}
          />
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
  maxHeight: "68vh  ",
  overflowX: "scroll",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [theme.breakpoints.down("md")]: {
    padding: "100px 15px 50px",
  },
}));

export default Hub;