import { useEffect, useContext, useState, useMemo } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
const Dots = dynamic(() => import('./Dots'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const Profile = ({ profilePubkey }) => {
  const {
    getUserCollectionAndPublished,
    releaseState,
    filterReleasesPublishedByUser,
    filterReleasesList,
  } = useContext(Release.Context)

  const { getHubsForUser, filterHubsForUser } = useContext(Hub.Context)

  const [profilePublishedReleases, setProfilePublishedReleases] =
    useState(undefined)
  const [profileCollectionReleases, setProfileCollectionReleases] =
    useState(undefined)
  const [profileHubs, setProfileHubs] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [profileCollectionIds, setProfileCollectionIds] = useState(undefined)
  const [fetched, setFetched] = useState({
    user: false,
    releases: false,
    collection: false,
    hubs: false,
  })
  const [views, setViews] = useState([
    { name: 'releases', playlist: undefined, visible: false },
    { name: 'collection', playlist: undefined, visible: false },
    { name: 'hubs', playlist: null, visible: false },
  ])

  const artistNames = useMemo(() => {
    if (profilePublishedReleases?.length > 0) {
      return [
        ...new Set(
          profilePublishedReleases?.map(
            (release) => release.metadata.properties.artist
          )
        ),
      ]
    }
  }, [profilePublishedReleases])

  useEffect(() => {
    const getUserData = async (profilePubkey) => {
      await getHubsForUser(profilePubkey)
      const [collectionIds, publishedIds] = await getUserCollectionAndPublished(
        profilePubkey
      )
      setProfileCollectionIds(collectionIds)
    }

    getUserData(profilePubkey)
    fetched.user = true
  }, [profilePubkey])

  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()

    if (profilePubkey) {
      const releases = filterReleasesPublishedByUser(profilePubkey)
      setProfilePublishedReleases(releases)

      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].playlist = releases

      fetched.releases = true

      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))

      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].playlist = filterReleasesList(profileCollectionIds)

      fetched.collection = true

      const hubs = filterHubsForUser(profilePubkey)

      setProfileHubs(hubs)
      fetched.hubs = true
      setFetched({
        ...fetched,
      })
    }

    setViews(updatedView)
  }, [profileCollectionIds, releaseState])

  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()
    if (profilePublishedReleases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].visible = true
    }
    if (profileCollectionReleases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].visible = true
    }

    if (profileHubs?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].visible = true
    }
    setViews(updatedView)
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs])

  useEffect(() => {
    if (profilePublishedReleases?.length > 0) {
      setActiveView(0)
    }
    if (
      profilePublishedReleases?.length === 0 &&
      profileCollectionReleases?.length > 0
    ) {
      setActiveView(1)
    }
    if (
      fetched.collection &&
      fetched.releases &&
      fetched.hubs &&
      profilePublishedReleases?.length === 0 &&
      profileCollectionReleases?.length === 0 &&
      profileHubs?.length > 0
    ) {
      setActiveView(2)
    }
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
  }

  const renderTables = (activeView) => {
    switch (activeView) {
      case 0:
        return (
          <ReusableTable
          tableType={'profilePublishedReleases'}
          releases={profilePublishedReleases}
          hasOverflow={true}
          />
        )
      case 1:
        return (
          <ReusableTable
          tableType={'profileCollectionReleases'}
          releases={profileCollectionReleases}
          hasOverflow={true}
          />
        )
      case 2:
        return (
          <ReusableTable
          tableType={'profileHubs'}
          releases={profileHubs}
          hasOverflow={true}
          />
        )
      default:
        break;
    }
  }

  return (
    <>
      

      <ProfileContainer>
        <ProfileHeaderWrapper>
          <ProfileHeaderContainer>
            {fetched.user && profilePubkey && (
              <Box sx={{ mb: 1 }}>
                <Typography>{truncateAddress(profilePubkey)}</Typography>
              </Box>
            )}
            {fetched.user && artistNames?.length > 0 && (
              <ProfileOverflowContainer>
                {`Publishes as ${artistNames?.map((name) => name).join(', ')}`}
              </ProfileOverflowContainer>
            )}
          </ProfileHeaderContainer>
        </ProfileHeaderWrapper>
        {fetched.user &&
          fetched.collection &&
          fetched.releases &&
          fetched.hubs && (
            <Box sx={{ py: 1 }}>
              <TabHeader
                viewHandler={viewHandler}
                isActive={activeView}
                profileTabs={views}
              />
            </Box>
          )}

        <>
          {!activeView === undefined && (
            <ProfileDotWrapper>
              <Box sx={{ margin: 'auto' }}>
                <Dots />
              </Box>
            </ProfileDotWrapper>
          )}


            <ProfileTableContainer>
              {renderTables(activeView)}
            </ProfileTableContainer>

          {/* {activeView === 0 && (
            <>
              {fetched.releases && profilePublishedReleases.length === 0 && (
                <Box>No releases belong to this address</Box>
              )}
              {fetched.releases && profilePublishedReleases.length > 0 && (
                <ProfileTableContainer>
                  <ReusableTable
                    tableType={'profilePublishedReleases'}
                    releases={profilePublishedReleases}
                    hasOverflow={true}
                  />
                </ProfileTableContainer>
              )}
            </>
          )}

          {activeView === 1 && (
            <>
              {fetched.collection && profileCollectionReleases.length === 0 && (
                <Box>No collection found at this address</Box>
              )}
              {fetched.collection && profileCollectionReleases.length > 0 && (
                <ProfileTableContainer>
                  <ReusableTable
                    tableType={'profileCollectionReleases'}
                    releases={profileCollectionReleases}
                    hasOverflow={true}
                  />
                </ProfileTableContainer>
              )}
            </>
          )}
          {activeView === 2 && (
            <>
              {fetched.hubs && profileHubs.length === 0 && (
                <Box>No Hubs belong to this address</Box>
              )}
              {fetched.hubs && profileHubs.length > 0 && (
                <ProfileTableContainer>
                  <ReusableTable
                    tableType={'profileHubs'}
                    releases={profileHubs}
                    hasOverflow={true}
                  />
                </ProfileTableContainer>
              )}
            </>
          )} */}
        </>
      </ProfileContainer>
    </>
  )
}

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  minWidth: theme.maxWidth,
  maxWidth: theme.maxWidth,
  height: '86vh',
  overflowY: 'hidden',
  margin: '75px auto 0px',

  ['-webkit-overflow-scroll']: 'touch',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop: '25px',
    paddingTop: 0,
    minHeight: '100% !important',
    maxHeight: '80vh',
    overflow: 'hidden',
    marginLeft: 0,    
    
  },
}))

const ProfileHeaderContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
}))

const ProfileHeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100vw',
  minHeight: '100px',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
    height: '100px',
  },
}))

const ProfileOverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  display: ['-webkit-box'],
  ['-webkit-line-clamp']: '5',
  ['-webkit-box-orient']: 'vertical',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    ['-webkit-line-clamp']: '4',
  },
}))

const ProfileTableContainer = styled(Box)(({ theme }) => ({
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '100px',
    overflow:'scroll'
  },
}))

const ProfileDotWrapper = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  width: '100%',
  height: '100%',
  display: 'flex',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '50%',
    top: '50%',
  },
}))

export default Profile
