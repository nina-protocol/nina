import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import { styled } from '@mui/material/styles'
import nina from '@ninaprotocol/nina-sdk'
import { Typography, Box } from '@mui/material'
import Button from '@mui/material/Button'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { useSnackbar } from 'notistack'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'

const { AudioPlayerContext, ReleaseContext } = nina.contexts

const Releases = ({ type }) => {
  const { getReleasesRecent, filterReleasesRecent, releasesRecentState } =
    useContext(ReleaseContext)
  const { resetQueueWithPlaylist } = useContext(AudioPlayerContext)
  const [listView, setListView] = useState(false)
  const [releases, setReleases] = useState([])
  const { enqueueSnackbar } = useSnackbar()

  const titleString = type === 'new' ? 'New Releases' : 'Highlights'

  useEffect(() => {
    getReleasesRecent()
  }, [])

  useEffect(() => {
    if (type === 'new') {
      setReleases(filterReleasesRecent().published)
    } else {
      setReleases(filterReleasesRecent().highlights)
    }
  }, [releasesRecentState])

  const handleViewChange = () => {
    setListView(!listView)
  }

  return (
    <>
      <Head>
        <title>{`Nina: ${titleString}`}</title>
        <meta name="description" content={`Nina: ${titleString}`} />
      </Head>
      <ScrollablePageWrapper>
        <ReleasesWrapper>
          <CollectionHeader listView={listView}>
            <Typography variant="body1" fontWeight="700">
              {titleString}
              <Button
                onClick={() =>
                  resetQueueWithPlaylist(
                    releases.map((release) => release.releasePubkey)
                  ).then(() =>
                    enqueueSnackbar(`Now Playing: ${titleString}`, {
                      variant: 'info',
                    })
                  )
                }
              >
                <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
              </Button>
            </Typography>
            <Typography
              onClick={handleViewChange}
              sx={{ cursor: 'pointer', margin: 'auto 0' }}
            >
              {listView ? 'Cover View' : 'List View'}
            </Typography>
          </CollectionHeader>
          {listView && (
            <ReleaseListTable
              releases={releases}
              tableType="allReleases"
              key="releases"
            />
          )}

          {!listView && <ReleaseTileList releases={releases} />}
        </ReleasesWrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const CollectionHeader = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '15px',
  '& .MuiButton-root:last-of-type': {
    [theme.breakpoints.down('md')]: {
      paddingRight: '4px',
    },
  },
}))
const ReleasesWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
  height: 'auto',
  minHeight: '50vh',
  margin: '0 auto',
  position: 'relative',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '80vh',
  },
}))

export default Releases
