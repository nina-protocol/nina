import React, { useEffect, useState, useContext, useRef } from 'react'
import debounce from 'lodash.debounce'
import Head from 'next/head'
import { styled } from '@mui/material/styles'
import nina from "@nina-protocol/nina-sdk";
import { Typography, Box } from '@mui/material'
import { isMobile } from 'react-device-detect'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'
import ReleaseSearch from './ReleaseSearch'
import Dots from './Dots'

const { ReleaseContext } = nina.contexts

const Releases = () => {
  const {
    getReleasesAll,
    filterReleasesAll,
    allReleases,
    allReleasesCount,
    searchResults,
  } = useContext(ReleaseContext)
  const [listView, setListView] = useState(false)
  const [pendingFetch, setPendingFetch] = useState(false)
  const [totalCount, setTotalCount] = useState(null)
  const scrollRef = useRef();

  useEffect(() => {
    getReleasesAll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const handleScroll = () => {
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight;
    if (
      bottom &&
      !pendingFetch &&
      totalCount !== allReleases.length &&
      !searchResults.searched
    ) {
      setPendingFetch(true)
      getReleasesAll()
    }
  }

  return (
    <>
      <Head>
        <title>{`Nina: All Releases`}</title>
        <meta name="description" content={'Nina: All Releases'} />
      </Head>
      <ScrollablePageWrapper onScroll={debounce(() => handleScroll(), 500)}>
        <AllReleasesWrapper ref={scrollRef}>
          <StyledReleaseSearch />
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
              releases={
                searchResults.releases.length > 0
                  ? searchResults.releases
                  : filterReleasesAll()
              }
              tableType="allReleases"
              key="releases"
            />
          )}

          {!listView && (
            <ReleaseTileList
              releases={
                searchResults.pending || searchResults.searched
                  ? searchResults.releases
                  : isMobile
                  ? filterReleasesAll().reverse()
                  : filterReleasesAll()
              }
            />
          )}
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

const StyledReleaseSearch = styled(ReleaseSearch)(() => ({
  position: 'sticky',
}))
const CollectionHeader = styled(Typography)(() => ({
  maxWidth: '100%',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '15px',
  fontWeight: '700',
  textTransform: 'uppercase',
  cursor: 'pointer',
}))

const AllReleasesWrapper = styled(Box)(({ theme }) => ({
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
