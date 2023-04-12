import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  createElement,
  Fragment,
} from 'react'
import dynamic from 'next/dynamic'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { parseChecker } from '@nina-protocol/nina-internal-sdk/esm/utils'

import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import Dots from './Dots'

import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
const ContentTileView = dynamic(() => import('./ContentTileView'))

const HubComponent = ({ hubPubkey }) => {
  const wallet = useWallet()
  const router = useRouter()
  const {
    hubState,
    hubCollaboratorsState,
    initialLoad,
    getHub,
    filterHubCollaboratorsForHub,
    filterHubContentForHub,
    hubContentFetched,
    hubContentState,
  } = useContext(Hub.Context)
  const { postState } = useContext(Nina.Context)
  const { releaseState } = useContext(Release.Context)
  const [contentData, setContentData] = useState({
    content: [],
    contentTypes: [],
  })
  const [hubReleases, setHubReleases] = useState(undefined)
  const [hubPosts, setHubPosts] = useState(undefined)

  useEffect(() => {
    getHub(hubPubkey)
    setContentData({
      content: [],
      contentTypes: [],
    })
    setHubReleases([])
    setHubPosts([])
  }, [hubPubkey])

  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  useEffect(() => {
    const [releases, posts] = filterHubContentForHub(hubPubkey)
    setHubReleases(releases)
    setHubPosts(posts)
  }, [hubContentState])

  const [description, setDescription] = useState()
  const hubCollaborators = useMemo(
    () => filterHubCollaboratorsForHub(hubPubkey) || [],
    [hubCollaboratorsState, hubPubkey]
  )

  useEffect(() => {
    if (hubReleases && hubPosts) {
      const contentArray = []
      const types = []
      const hubContent = [...hubReleases, ...hubPosts]
      hubContent.forEach((hubContentData) => {
        if (hubContentData.hub === hubPubkey) {
          if (
            hubContentData.contentType === 'ninaReleaseV1' &&
            releaseState.metadata[hubContentData.release] &&
            hubContentData.visible
          ) {
            const hubReleaseIsReference =
              hubContent.filter(
                (c) =>
                  c.referenceContent === hubContentData.release && c.visible
              ).length > 0
            if (!hubReleaseIsReference) {
              hubContentData = {
                ...hubContentData,
                ...releaseState.metadata[hubContentData.release],
              }
              contentArray.push(hubContentData)
            }
            if (
              hubContentData.publishedThroughHub === hubPubkey ||
              releaseState.tokenData[hubContentData.release]?.authority ===
                hubData?.authority
            ) {
              types.push('Releases')
            } else {
              types.push('Reposts')
            }
          } else if (
            hubContentData.contentType === 'post' &&
            postState[hubContentData.post] &&
            hubContentData.visible
          ) {
            hubContentData = {
              ...hubContentData,
              ...postState[hubContentData.post],
              hubPostPublicKey: hubContentData.publicKey,
            }
            if (hubContentData.referenceContent !== undefined) {
              hubContentData.releaseMetadata =
                releaseState.metadata[hubContentData.referenceContent]
              hubContentData.contentType = 'postWithRelease'
            }
            types.push('Text Posts')
            contentArray.push(hubContentData)
          }
        }
      })
      const uniqueTypes = [...new Set(types)]
      setContentData({
        content: contentArray.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        ),
        contentTypes: uniqueTypes,
      })
    }
  }, [hubReleases, hubPosts])

  useEffect(() => {
    if (hubData?.data?.descriptionHtml) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(parseChecker(hubData.data.descriptionHtml))
        .then((file) => {
          setDescription(file.result)
        })
    } else {
      setDescription(
        hubData?.data?.descriptionHtml || hubData?.data?.description
      )
    }
  }, [hubData?.data?.descriptionHtml, hubData?.data?.description])

  if (!hubState[hubPubkey]?.data) {
    return null
  }
  if (!hubData) {
    return (
      <Box margin="auto">
        <Dots size="80px" />
      </Box>
    )
  }
  return (
    <>
      <Grid item md={4} sx={{ padding: { md: '15px', xs: '40px 15px 15px' } }}>
        {hubData.data.description.length > 0 && (
          <DescriptionWrapper
            sx={{ padding: { md: '15px', xs: '40px 0 0' }, width: '100%' }}
          >
            <Typography align="left" sx={{ color: 'text.primary' }}>
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
        {hubContentFetched.has(hubPubkey) &&
          contentData.content?.length > 0 && (
            <ContentTileView
              contentData={contentData}
              hubPubkey={hubPubkey}
              hubHandle={hubData.handle}
            />
          )}
        {hubContentFetched.has(hubPubkey) &&
          contentData.content?.length === 0 && (
            <>
              <Typography>
                Nothing has been published to this Hub yet
              </Typography>
              {hubCollaborators
                .map((collaborator) => collaborator.collaborator)
                .includes(wallet?.publicKey?.toBase58()) && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    router.push(
                      `/${hubData.handle}/dashboard?action=publishRelease`
                    )
                  }
                  sx={{ height: '56px', width: '25%', marginTop: '20px' }}
                >
                  {`Publish a release`}
                </Button>
              )}
            </>
          )}
      </ContentViewWrapper>
    </>
  )
}

const ContentViewWrapper = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: '15px',
  },
}))

const DescriptionWrapper = styled(Grid)(({ theme }) => ({
  padding: ' 0px 15px',
  maxHeight: '68vh',
  overflowX: 'hidden',
  overflowY: 'scroll',
  h1: {
    lineHeight: '32px',
  },
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    maxHeight: 'unset',
    padding: '100px 15px 50px',
  },
  'p, a': {
    padding: '0 0 8px',
    margin: '0',
  },
  a: {
    textDecoration: 'underline',
  },
}))

export default HubComponent
