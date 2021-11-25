import React, { useEffect, useState, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { Box } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { ReleaseContext } = ninaCommon.contexts

const Releases = () => {
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(ReleaseContext)
  const [releases, setReleases] = useState([])

  useEffect(() => {
    getReleasesRecent()
  }, [])

  useEffect(() => {
    setReleases(filterReleasesRecent().published)
  }, [releasesRecentState])
  return (
    <>
      <Helmet>
        <title>{`Nina: All Releases`}</title>
        <meta name="description" content={'Nina: All Releases'} />
      </Helmet>
      <ScrollablePageWrapper>
        <AllReleasesWrapper>
          <ReleaseListTable
            releases={releases}
            tableType="allReleases"
            key="releases"
          />
        </AllReleasesWrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const AllReleasesWrapper = styled(Box)(({ theme }) => ({
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    // width: '100vw',
    padding: '0px 30px',
    overflowX: 'auto',
  },
}))

export default Releases
