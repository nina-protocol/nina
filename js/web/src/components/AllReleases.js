import React, { useEffect, useState, useContext } from 'react'
import debounce from 'lodash.debounce'
import { Helmet } from 'react-helmet'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { Typography, Box } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'

const { ReleaseContext } = ninaCommon.contexts
const { Dots } = ninaCommon.components

const Releases = () => {
  const { getReleasesAll, filterReleasesAll, allReleases, allReleasesCount } =
    useContext(ReleaseContext)
  const [listView, setListView] = useState(false)
  const [pendingFetch, setPendingFetch] = useState(false)
  const [totalCount, setTotalCount] = useState(null)

  useEffect(() => {
    getReleasesAll()
  }, [])

  useEffect(() => {
    if (allReleases.length > 0) {
      setPendingFetch(false)
    }
  }, [allReleases])

  useEffect(() => {
    setTotalCount(allReleasesCount)
  }, [allReleasesCount])

  const handleViewChange = () => {
    setListView(!listView)
  }

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (bottom && !pendingFetch && totalCount !== allReleases.length) {
      setPendingFetch(true)
      getReleasesAll()
    }
  }

  return (
    <>
      <Helmet>
        <title>{`Nina: All Releases`}</title>
        <meta name="description" content={'Nina: All Releases'} />
      </Helmet>
      <ScrollablePageWrapper onScroll={debounce((e) => handleScroll(e), 500)}>
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
              releases={filterReleasesAll()}
              tableType="allReleases"
              key="releases"
            />
          )}

          {!listView && <ReleaseTileList releases={filterReleasesAll()} />}
          {pendingFetch && (
            <StyledDots>
              <Dots size="80px" />
            </StyledDots>
          )}
        </AllReleasesWrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const StyledDots = styled(Box)(() => ({
  marginTop: '40px',
}))

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
