import React, { useEffect, useState, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { Typography, Box } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'

const { ReleaseContext } = ninaCommon.contexts

const Releases = () => {
  const { getReleasesAll, releaseState, filterReleasesAll } =
    useContext(ReleaseContext)
  const [releases, setReleases] = useState([])
  const [listView, setListView] = useState(false)

  useEffect(() => {
    getReleasesAll(releases.length)
  }, [])

  useEffect(() => {
    setReleases(filterReleasesAll())
  }, [releaseState])

  const handleViewChange = () => {
    setListView(!listView)
  }

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (bottom) {
      getReleasesAll(releases.length)
    }
  }

  return (
    <>
      <Helmet>
        <title>{`Nina: All Releases`}</title>
        <meta name="description" content={'Nina: All Releases'} />
      </Helmet>
      <ScrollablePageWrapper onScroll={(e) => handleScroll(e)}>
        <AllReleasesWrapper>
          <CollectionHeader
            onClick={handleViewChange}
            listView={listView}
            align="left"
            variant="body1"
          >
            {listView ? 'Cover View' : 'List View'}
          </CollectionHeader>

          {listView && (
            <ReleaseListTable
              releases={releases}
              tableType="allReleases"
              key="releases"
            />
          )}

          {!listView && <ReleaseTileList releases={releases} />}
        </AllReleasesWrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const CollectionHeader = styled(Typography)(({ listView }) => ({
  maxWidth: listView ? '764px' : '960px',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '15px',
  fontWeight: '700',
  textTransform: 'uppercase',
  cursor: 'pointer',
}))

const AllReleasesWrapper = styled(Box)(({ theme }) => ({
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
  },
}))

export default Releases
