import { useMemo, useEffect, useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import dynamic from 'next/dynamic'
import { Box } from '@mui/material'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/system'

const Dots = dynamic(() => import('./Dots'))
const ScrollablePageWrapper = dynamic(() => import('./ScrollablePageWrapper'))
const ProfileReleases = dynamic(() => import('./ProfileReleases'))
const ProfileHubs = dynamic(() => import('./ProfileHubs'))
const ProfileCollection = dynamic(() => import('./ProfileCollection'))
const ProfileToggle = dynamic(() => import('./ProfileToggle'))
const Profile = ({ userId }) => {
  const {
    getUserCollectionAndPublished,
    releaseState,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    getReleasesPublishedByUser,
    filterReleasesList,
  } = useContext(Release.Context)

  const { getHubsForUser, filterHubsForUser, hubState } = useContext(
    Hub.Context
  )

  const [profilePublishedReleases, setProfilePublishedReleases] = useState([])
  const [profileCollectionReleases, setProfileCollectionReleases] = useState()
  const [profileHubs, setProfileHubs] = useState([])
  const [view, setView] = useState('releases')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [profileCollectionIds, setProfileCollectionIds] = useState(undefined)
  const [toggleView, setToggleView] = useState('releases')
  const [fetchingUser, setFetchingUser] = useState('fetching')
  const [fetchingReleases, setFetchingReleases] = useState('fetching')
  const [fetchingHubs, setFetchingHubs] = useState('fetching')
  const [fetchingCollection, setFetchingCollection] = useState('fetching')

  useEffect(() => {
    setFetchingUser('fetching')
    const getUserData = async (userId) => {
      await getHubsForUser(userId)
      const [collectionIds] = await getUserCollectionAndPublished(userId)
      setProfileCollectionIds(collectionIds)
    }
    if (userId) {
      setFetchingUser('fetched')
      getUserData(userId)
    }
  }, [userId])

  useEffect(() => {
    setFetchingReleases('fetching')
    setFetchingCollection('fetching')
    if (profileCollectionIds?.length > 0 && userId) {
      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
      const releases = filterReleasesPublishedByUser(userId)
      setProfilePublishedReleases(releases)
      setFetchingReleases('fetched')
      setFetchingCollection('fetched')
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    setFetchingHubs('fetching')
    const hubs = filterHubsForUser(userId)
    if(hubs){
      setProfileHubs(hubs)
      setFetchingHubs('fetched')
    }
  }, [hubState])

  const releasesClickHandler = () => {
    setView('releases')
    setToggleView('releases')
  }
  const hubsClickHandler = () => {
    setView('hubs')
    setToggleView('hubs')
  }
  const collectionClickHandler = () => {
    setView('collection')
    setToggleView('collection')
  }
  console.log('profileHubs', profileHubs)
  return (
    <ResponsiveProfileContainer>
      <ResponsiveProfileHeaderContainer>
        <Box sx={{pl:1, maxWidth: '100%',}}>
        {fetchingUser === 'fetching' && <Box><Dots/></Box>}
        {fetchingUser === 'fetched' && userId}
        </Box>
      </ResponsiveProfileHeaderContainer>
      <Box sx={{ py:1}}>
        <ProfileToggle
          releaseClick={() => releasesClickHandler()}
          hubClick={() => hubsClickHandler()}
          collectionClick={() => collectionClickHandler()}
          isClicked={toggleView}
        />
      </Box>
        <Box sx={{ minHeight: '50vh', }}>      
        {view === 'releases' && (
          <>
            {fetchingReleases === 'fetching' && <Box><Dots/></Box>}
            {fetchingReleases === 'fetched' &&
              profilePublishedReleases.length === 0 && (
                <Box sx={{p:1, m:1}}>No releases belong to this address</Box>
              )}
            {fetchingReleases === 'fetched' && (
              <ProfileReleases profileReleases={profilePublishedReleases} />
            )}
          </>
        )}
        {view === 'hubs' && (
          <>
          {fetchingHubs === 'fetching' && <Box><Dots/></Box>}
          {fetchingHubs === 'fetched' && profileHubs.length === 0 && (<Box>No Hubs belong to this address</Box>)}
          {fetchingHubs === 'fetched' && <ProfileHubs profileHubs={profileHubs} />}
          </>
        )}
        {view === 'collection' && (
          <>
          {fetchingCollection === 'fetching' && <Box><Dots/></Box>}
          {fetchingCollection === 'fetched' && profileHubs.length === 0 && (<Box>No collection found at this address</Box>)}
          {fetchingCollection === 'fetched' && <ProfileCollection profileCollection={profileCollectionReleases} />} 
          </>
        )}
        </Box>
    </ResponsiveProfileContainer>
  )
}

const ResponsiveProfileContainer = styled(Box)(({theme}) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign:'center',
  minWidth:'960px',
  maxWidth: '960px',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    overflow:'auto'
  }
}))

const ResponsiveProfileHeaderContainer = styled(Box)(({theme}) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  pl:1,
  pb:1,
  maxWidth: '100%',
  [theme.breakpoints.down('md')]: {
    pl:0,
    pb:2,
    mb:2,
    width: '100vw'
  }
}))

export default Profile
