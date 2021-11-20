import React, { useEffect, useState, useContext } from 'react'
import { Helmet } from 'react-helmet'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'

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
    <>
      <Helmet>
        <title>{`Nina: Your Collection(${
          userCollectionReleases?.length || 0
        })`}</title>
        <meta name="description" content={'Your collection on Nina.'} />
      </Helmet>
      <ScrollablePageWrapper>
        {wallet?.connected && userCollectionReleases?.length > 0 && (
          <ReleaseListTable
            releases={userCollectionReleases}
            tableType="userCollection"
            key="releases"
          />
        )}
        {wallet?.connected && userCollectionReleases?.length === 0 && (
          <Typography>Your collection is empty!</Typography>
        )}
      </ScrollablePageWrapper>
    </>
  )
}

export default ReleaseList
