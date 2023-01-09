import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { useSnackbar } from 'notistack'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'
import Link from 'next/link'

const Releases = ({ type }) => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getReleasesRecent, filterReleasesRecent, releasesRecentState } =
    useContext(Release.Context)
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
      <ScrollablePageWrapper paddingTop={'180px'}>
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

        {type === 'new' && (
          <BlueTypography variant="h1">
            <Link href="/releases">All Releases</Link>
          </BlueTypography>
        )}
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

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': { color: theme.palette.blue },
  marginTop: theme.spacing(6),
  [theme.breakpoints.down('md')]: {
    marginTop: '0',
  },
}))

export default Releases
