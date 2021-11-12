import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, Typography } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'

const { ReleaseContext, NinaContext } = ninaCommon.contexts

const ReleaseList = () => {
  const { filterReleasesUserCollection, releaseState } =
    useContext(ReleaseContext)

  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  const [userCollectionReleases, setUserCollectionReleases] = useState()

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleases(filterReleasesUserCollection())
    }
  }, [releaseState, collection])

  return (
    <StyledBox className={classes.root}>
      {wallet?.connected && userCollectionReleases?.length > 0 && (
        <ReleaseListTable
          releases={userCollectionReleases}
          tableType="userCollection"
          key="releases"
        />
      )}
      {wallet?.connected && userCollectionReleases?.length === 0 && (
        <Typography>
          <h1>Your collection is empty!</h1>
        </Typography>
      )}
    </StyledBox>
  )
}

const PREFIX = 'ReleaseList'

const classes = {
  root: `${PREFIX}-root`,
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
  padding: '280px 0 80px 0',
}))

export default ReleaseList
