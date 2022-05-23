import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  createElement,
  Fragment,
} from 'react'
import dynamic from 'next/dynamic'
import nina from '@nina-protocol/nina-sdk'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'

import Typography from '@mui/material/Typography'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
const PostRelease = dynamic(() => import('./PostRelease'))
const { HubContext, NinaContext, ReleaseContext, AudioPlayerContext } =
  nina.contexts

const Post = ({ postDataSsr, hub, postPubkey, hubPostPubkey, hubPubkey}) => {
  const router = useRouter()
  // const {updateTrack, track, isPlaying} = useContext(AudioPlayerContext);
  const [referenceReleasePubkey, setReferenceReleasePubkey] = useState()
  const [referenceReleaseMetadata, setReferenceReleaseMetadata] = useState()
  const [postContent, setPostContent] = useState(Fragment)

  const [postData, setPostData] = useState(postDataSsr || null)

  const [metadata, setMetadata] = useState()

  const { postState } = useContext(NinaContext)
  const { getHub, hubState, hubContentState, getHubPost } = useContext(HubContext)
  const { getRelease, releaseState } = useContext(ReleaseContext)


  useEffect(() => {
    if (hubPostPubkey && !postState[postPubkey]) {
      getHubPost(hubPostPubkey)
    }
  }, [hubPostPubkey])

  useEffect(() => {
    if (hubPubkey && !hubState[hubPubkey]) {
      getHub( hubPubkey )
    }
  }, [hubPubkey, getHub])

  useEffect(() => {
    if (postState[postPubkey] && !postData) {
      setPostData(postState[postPubkey])
    }
  }, [postState, postPubkey])

  useEffect(() => {
    if (hubContentState && postPubkey) {
      const metadata = Object.values(hubContentState).find(
        (content) => content.post === postPubkey
      )
      setMetadata(metadata)
      if (metadata?.referenceHubContent && !referenceReleasePubkey) {
        setReferenceReleasePubkey(metadata.referenceHubContent)
        getRelease(metadata.referenceHubContent)
      }
    }
  }, [hubContentState, postPubkey])

  useEffect(() => {
    if (releaseState.metadata[referenceReleasePubkey]) {
      setReferenceReleaseMetadata(releaseState.metadata[referenceReleasePubkey])
    }
  }, [releaseState, referenceReleasePubkey])
  useEffect(() => {
    if (postState[postPubkey]?.postContent.json.body) {
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
        .process(
          JSON.parse(postState[postPubkey].postContent.json.body).replaceAll(
            '<p><br></p>',
            '<br>'
          )
        )
        .then((file) => {
          setPostContent(file.result)
        })
    }
  }, [postState[postPubkey]])

  const formattedDate = (date) => {
    return new Date(typeof date === 'number' ? date * 1000 : date).toLocaleDateString()
  }
  return (
    <>
      <BackButton onClick={() => router.back()} />
      <Grid
        item
        md={6}
        xs={12}
        sx={{
          margin: { md: '0px auto auto', xs: '0px' },
          padding: '0 15px',
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
          margin: { md: '0px auto auto', xs: '0px' },
          padding: '0 15px',
        }}
      >
        {postData && (
          <PostWrapper>
            <Typography variant="h4" fontWeight="600" align="left">
              {postData.postContent.json.title}
            </Typography>
            <Typography align="left">{postContent}</Typography>
            <Divider />
            <Typography align="left" sx={{ marginTop: '20px' }}>
              Published by:{' '}
              <a
                href={`https://ninaprotocol.com/collection/${postData.author}`}
                target="_blank"
                rel="noreferrer"
              >
                {postData.author}
              </a>{' '}
              at{' '}
              <a
                href={`https://explorer.solana.com/account/${postData.postId}`}
                target="_blank"
                rel="noreferrer"
              >
                {formattedDate(postData.createdAt)}
              </a>
            </Typography>
          </PostWrapper>
        )}
      </Grid>
    </>
  )
}

const PostWrapper = styled(Box)(({ theme }) => ({
  paddingBottom: '20px',
  maxHeight: '86vh',
  overflowX: 'scroll',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}))

const BackButton = styled(ArrowBackIosIcon)(({ theme }) => ({
  width: '30px',
  height: '30px',
  position: 'absolute',
  zIndex: '1000000',
  top: '15px',
  left: '15px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

export default Post
