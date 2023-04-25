import React, { useMemo, useContext, useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useSnackbar } from 'notistack'
import HubPostCreate from '@nina-protocol/nina-internal-sdk/esm/HubPostCreate'
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from '../styles/theme/lightThemeOptions.js'

const HubPosts = ({ hubPubkey, isAuthority, canAddContent }) => {
  const { wallet } = useContext(Wallet.Context)
  const { hubContentToggleVisibility, hubContentState, hubState } = useContext(
    Hub.Context
  )
  const { postState } = useContext(Nina.Context)

  const hubData = useMemo(() => hubState[hubPubkey], [hubState])
  const { enqueueSnackbar } = useSnackbar()
  const hubPosts = useMemo(
    () =>
      Object.values(hubContentState)
        .sort((a, b) => b.datetime - a.datetime)
        .filter((c) => c.contentType === 'post' && c.visible),
    [hubContentState]
  )
  const hubPostsArchived = useMemo(
    () =>
      Object.values(hubContentState).filter(
        (c) => c.contentType === 'post' && !c.visible
      ),
    [hubContentState]
  )
  const hubReleases = useMemo(
    () =>
      Object.values(hubContentState)
        .sort((a, b) => b.datetime - a.datetime)
        .filter(
          (c) =>
            c.contentType === 'ninaReleaseV1' &&
            c.visible &&
            hubPosts.filter((post) => post.referenceContent === c.publicKey)
              .length === 0 &&
            hubPostsArchived.filter(
              (post) => post.referenceContent === c.publicKey
            ).length === 0
        ),
    [hubContentState, hubPosts, hubPostsArchived]
  )

  const [hubPostsShowArchived, sethubPostsShowArchived] = useState(false)
  const activeHubPosts = useMemo(
    () => (hubPostsShowArchived ? hubPostsArchived : hubPosts),
    [hubPostsShowArchived, hubPosts, hubPostsArchived]
  )

  const canTogglePost = (hubPost) => {
    if (hubPost.addedBy == wallet?.publicKey?.toBase58() || isAuthority) {
      return true
    }
    return false
  }

  const handleTogglePost = async (hubPubkey, postPubkey) => {
    const result = await hubContentToggleVisibility(
      hubPubkey,
      postPubkey,
      'Post'
    )
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'info' : 'failure',
    })
  }
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
                There are {Object.keys(activeHubPosts).length}{' '}
                {hubPostsShowArchived ? 'archived' : ''} Posts associated with
                this hub:
              </DashboardHeader>
              <ul>
                {Object.keys(activeHubPosts).map((postPubkey) => {
                  const hubPost = activeHubPosts[postPubkey]
                  const postContent = postState[hubPost.post]
                  return (
                    <DashboardEntry key={hubPost.post}>
                      <Link
                        href={`/${hubData.handle}/posts/${hubPost.publicKey}`}
                      >
                        <a>{postContent.data.title}</a>
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
                  )
                })}
                <Button
                  onClick={() => sethubPostsShowArchived(!hubPostsShowArchived)}
                  sx={{ paddingLeft: '0' }}
                >
                  View{' '}
                  {
                    Object.keys(
                      !hubPostsShowArchived ? hubPostsArchived : hubPosts
                    ).length
                  }{' '}
                  {!hubPostsShowArchived ? 'Archived' : ''} Posts
                </Button>
              </ul>
            </>
          )}
        </DashboardContent>
      </DashboardWrapper>
    </>
  )
}

export default HubPosts
