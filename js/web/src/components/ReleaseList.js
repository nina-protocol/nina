import React, { useEffect, useState, useContext } from 'react'
// import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
// import TextField from '@mui/material/TextField'
import { Box, Typography } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { ReleaseContext, NinaContext } = ninaCommon.contexts

const ReleaseList = () => {
  const {
    getReleasesRecent,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    collectRoyaltyForRelease,
    releaseState,
  } = useContext(ReleaseContext)

  const wallet = useWallet()
  const { collection } = useContext(NinaContext)

  useEffect(() => {
    getReleasesRecent()
  }, [])
  const [userPublishedReleases, setUserPublishedReleases] = useState()

  useEffect(() => {
    if (wallet?.connected && !userPublishedReleases) {
      getReleasesPublishedByUser()
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser())
    }
  }, [releaseState, collection])

  return (
    <ScrollablePageWrapper>
      <Box>
        {wallet?.connected && userPublishedReleases?.length > 0 && (
          <ReleaseListTable
            releases={userPublishedReleases}
            tableType="userPublished"
            collectRoyaltyForRelease={collectRoyaltyForRelease}
            key="releases"
          />
        )}
        {wallet?.connected && userPublishedReleases?.length === 0 && (
          <>
            <Typography>{`You haven't published any music yet.`}</Typography>
          </>
        )}
      </Box>
    </ScrollablePageWrapper>
  )
}

export default ReleaseList
