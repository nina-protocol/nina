import React, { useEffect, useState, useContext, useRef } from 'react'
import debounce from 'lodash.debounce'
import Head from 'next/head'
import { styled } from '@mui/material/styles'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Box from '@mui/material/Box'
import { isMobile } from 'react-device-detect'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import ReleaseTileList from './ReleaseTileList'
import Dots from './Dots'

const Releases = () => {
  const {
    getReleasesAll,
    filterReleasesAll,
    allReleases,
    allReleasesCount,
    searchResults,
  } = useContext(Release.Context)
  const [pendingFetch, setPendingFetch] = useState(false)
  const [totalCount, setTotalCount] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    getReleasesAll()
    window.addEventListener('scroll', handleScroll)
       console.log('releases', allReleases)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (allReleases.length > 0) {
      setPendingFetch(false)
    }
  }, [allReleases])

  useEffect(() => {
    setTotalCount(allReleasesCount)
  }, [allReleasesCount])

  const handleScroll = () => {
    const bottom =
      scrollRef?.current?.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
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
      <ScrollablePageWrapper
        paddingTop={'210px'}
        onScroll={debounce(() => handleScroll(), 500)}
      >
        <AllReleasesWrapper ref={scrollRef}>
          <ReleaseTileList
            releases={
              searchResults.pending || searchResults.searched
                ? searchResults.releases
                : isMobile
                ? filterReleasesAll().reverse()
                : filterReleasesAll()
            }
          />
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

const AllReleasesWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
  height: 'auto',
  minHeight: '75vh',
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
