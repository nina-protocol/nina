import React, { useState, useContext, useEffect } from 'react'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { makeStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import SwipeableViews from 'react-swipeable-views'
import ReleaseListTable from './ReleaseListTable'

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const UserView = () => {
  const classes = useStyles()
  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    filterReleasesUserCollection,
    collectRoyaltyForRelease,
  } = useContext(ReleaseContext)
  const [index, setIndex] = useState(0)
  const [userPublishedReleases, setUserPublishedReleases] = useState()
  const [userCollectionReleases, setUserCollectionReleases] = useState()

  useEffect(() => {
    if (index === 1) {
      getReleasesPublishedByUser()
    }
  }, [index])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser())
      setUserCollectionReleases(filterReleasesUserCollection())
    }
  }, [releaseState, collection])

  const handleChange = (event, value) => {
    setIndex(value)
  }

  const handleChangeIndex = (index) => {
    setIndex(index)
  }

  return (
    <Box classes={classes.root}>
      <Tabs value={index} onChange={handleChange} className={classes.tabs}>
        <Tab label="Collection" />
        <Tab label="Releases" />
        <Tab label="Royalties" />
      </Tabs>
      <SwipeableViews
        index={index}
        onChangeIndex={handleChangeIndex}
        containerStyle={{ height: 500 }}
      >
        <div className={classes.slide}>
          {userCollectionReleases?.length > 0 && (
            <ReleaseListTable
              releases={userCollectionReleases}
              tableType="userCollection"
              key="collection"
            />
          )}
          {userCollectionReleases?.length == 0 && (
            <>
              <h1>Your collection is empty!</h1>
            </>
          )}
        </div>
        <div className={classes.slide}>
          {userPublishedReleases?.length > 0 && (
            <ReleaseListTable
              releases={userPublishedReleases}
              tableType="userPublished"
              collectRoyaltyForRelease={collectRoyaltyForRelease}
              key="releases"
            />
          )}
          {userPublishedReleases?.length === 0 && (
            <>
              <h1>{`You haven't published any music yet.`}</h1>
            </>
          )}
        </div>
      </SwipeableViews>
    </Box>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tabs: {
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
  },
  slideContainer: {
    height: '100',
  },
  slide: {
    padding: '0px',
    minHeight: 100,
    color: '#000',
  },
}))

export default UserView
