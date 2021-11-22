import React, { useEffect, useState, useContext } from 'react'
import { Helmet } from 'react-helmet'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ReleaseTileList from './ReleaseTileList'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Switch from '@mui/material/Switch';


const { ReleaseContext, NinaContext } = ninaCommon.contexts

const ReleaseList = () => {
  const { filterReleasesUserCollection, releaseState } =
    useContext(ReleaseContext)
  const [listView, setListView] = useState(false)


  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  const [userCollectionReleases, setUserCollectionReleases] = useState()

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleases(filterReleasesUserCollection())
    }
  }, [releaseState, collection])


  const handleViewChange = (e) => {
    console.log('e.target.checked :>> ', e.target.checked);
    setListView(e.target.checked)
  }
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
          <>
          <Switch color="primary" onChange={handleViewChange} />
          {listView && 
            <ReleaseListTable
              releases={userCollectionReleases}
              tableType="userCollection"
              key="releases"
            />
          }
          {!listView && 
            <ReleaseTileList
              releases={userCollectionReleases}
              tableType="userCollection"
              key="releases"
            />
          }
          </>
        )}
        {wallet?.connected && userCollectionReleases?.length === 0 && (
          <Typography>Your collection is empty!</Typography>
        )}
      </ScrollablePageWrapper>
    </>
  )
}

export default ReleaseList
