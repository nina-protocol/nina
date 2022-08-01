import React, { useMemo, useContext, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {HubContext} from "@nina-protocol/nina-sdk/esm/contexts/Hub/Hub";
import {NinaContext} from "@nina-protocol/nina-sdk/esm/contexts/Nina/Nina";
import { useSnackbar } from "notistack";
import HubPostCreate from "./HubPostCreate";
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from "../styles/theme/lightThemeOptions.js";

const HubPosts = ({ hubPubkey, isAuthority, canAddContent }) => {
  const wallet = useWallet();
  const { hubContentToggleVisibility, hubContentState, hubState } =
    useContext(HubContext);
  const hubData = useMemo(() => hubState[hubPubkey], [hubState]);
  const { postState } = useContext(NinaContext);

  const { enqueueSnackbar } = useSnackbar();
  const hubPosts = useMemo(
    () =>
      Object.values(hubContentState)
        .sort((a, b) => b.datetime - a.datetime)
        .filter((c) => c.contentType === "Post" && c.visible),
    [hubContentState]
  );
  const hubPostsArchived = useMemo(
    () =>
      Object.values(hubContentState).filter(
        (c) => c.contentType === "Post" && !c.visible
      ),
    [hubContentState]
  );
  const hubReleases = useMemo(
    () =>
      Object.values(hubContentState)
        .sort((a, b) => b.datetime - a.datetime)
        .filter(
          (c) =>
            c.contentType === "NinaReleaseV1" &&
            c.visible &&
            hubPosts.filter((post) => post.referenceContent === c.publicKey)
              .length === 0 &&
            hubPostsArchived.filter(
              (post) => post.referenceContent === c.publicKey
            ).length === 0
        ),
    [hubContentState, hubPosts, hubPostsArchived]
  );

  const [hubPostsShowArchived, sethubPostsShowArchived] = useState(false);
  const activeHubPosts = useMemo(
    () => (hubPostsShowArchived ? hubPostsArchived : hubPosts),
    [hubPostsShowArchived, hubPosts, hubPostsArchived]
  );

  const canTogglePost = (hubPost) => {
    if (hubPost.addedBy == wallet?.publicKey?.toBase58() || isAuthority) {
      return true;
    }
    return false;
  };

  const handleTogglePost = async (hubPubkey, postPubkey) => {
    const result = await hubContentToggleVisibility(
      hubPubkey,
      postPubkey,
      "Post"
    );
    enqueueSnackbar(result.msg, {
      variant: result.success ? "info" : "failure",
    });
  };

  return (
    <>
      <DashboardWrapper
        md={9}
        columnSpacing={2}
        columnGap={2}
        height="100% !important"
      >
        <DashboardContent item md={6}>
          <HubPostCreate
            canAddContent={canAddContent}
            hubPubkey={hubPubkey}
            selectedHubId={hubPubkey}
            hubReleasesToReference={hubReleases}
          />
        </DashboardContent>
        <DashboardContent item md={6}>
          {activeHubPosts && postState && (
            <>
              <DashboardHeader style={{ fontWeight: 600 }}>
                There are {Object.keys(activeHubPosts).length}{" "}
                {hubPostsShowArchived ? "archived" : ""} Posts associated with
                this hub:
              </DashboardHeader>
              <ul>
                {Object.keys(activeHubPosts).map((postPubkey) => {
                  const hubPost = activeHubPosts[postPubkey];
                  const postContent = postState[hubPost.post].postContent;
                  return (
                    <DashboardEntry key={hubPost.post}>
                      <Link
                        href={`/${hubData.handle}/posts/${hubPost.publicKey}`}
                      >
                        {postContent.json.title}
                      </Link>
                      {canTogglePost(hubPost) && hubPostsShowArchived && (
                        <AddIcon
                          onClick={() =>
                            handleTogglePost(hubPubkey, hubPost.post)
                          }
                        ></AddIcon>
                      )}

                      {canTogglePost(hubPost) && !hubPostsShowArchived && (
                        <CloseIcon
                          onClick={() =>
                            handleTogglePost(hubPubkey, hubPost.post)
                          }
                        ></CloseIcon>
                      )}
                    </DashboardEntry>
                  );
                })}
                <Button
                  onClick={() => sethubPostsShowArchived(!hubPostsShowArchived)}
                  sx={{ paddingLeft: "0" }}
                >
                  View{" "}
                  {
                    Object.keys(
                      !hubPostsShowArchived ? hubPostsArchived : hubPosts
                    ).length
                  }{" "}
                  {!hubPostsShowArchived ? "Archived" : ""} Posts
                </Button>
              </ul>
            </>
          )}
        </DashboardContent>
      </DashboardWrapper>
    </>
  );
};

export default HubPosts;
