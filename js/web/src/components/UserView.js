import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles';
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'

import { Box } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SwipeableViews from 'react-swipeable-views'
import ReleaseListTable from './ReleaseListTable'

const PREFIX = 'UserView';

const classes = {
  root: `${PREFIX}-root`,
  tabs: `${PREFIX}-tabs`,
  slideContainer: `${PREFIX}-slideContainer`,
  slide: `${PREFIX}-slide`
};

const StyledBox = styled(Box)(() => ({
  [`& .${classes.root}`]: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.tabs}`]: {
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
  },

  [`& .${classes.slideContainer}`]: {
    height: '100',
  },

  [`& .${classes.slide}`]: {
    padding: '0px',
    minHeight: 100,
    color: '#000',
  }
}));

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const UserView = () => {

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
    <StyledBox classes={classes.root}>
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
    </StyledBox>
  );
}

export default UserView
