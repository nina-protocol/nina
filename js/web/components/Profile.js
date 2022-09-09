import { useMemo, useEffect, useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'

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
  useEffect(() => {
    const getUserData = async (userId) => {
      await getHubsForUser(userId)
      const [collectionIds] = await getUserCollectionAndPublished(userId)

      setProfileCollectionIds(collectionIds)
    }
    if (userId) {
      getUserData(userId)
    }
  }, [userId])

  useEffect(() => {
    if (profileCollectionIds?.length > 0 && userId) {
      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
      const releases = filterReleasesPublishedByUser(userId)
      setProfilePublishedReleases(releases)
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    const hubs = filterHubsForUser(userId)
    setProfileHubs(hubs)
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
  return (
    <Box
      sx={{
        width: '100%',
        height: '65vh',
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          m: 1,
        }}
      >
        {userId}
      </Box>
      <Box>
        <ProfileToggle
          releaseClick={() => releasesClickHandler()}
          hubClick={() => hubsClickHandler()}
          collectionClick={() => collectionClickHandler()}
          isClicked={toggleView}
        />
      </Box>
      <Box sx={{ height: '50vh', overflow: 'auto'  }}>
        {view === 'releases' && (
          <ProfileReleases profileReleases={profilePublishedReleases} />
        )}
        {view === 'hubs' && 
        <ProfileHubs profileHubs={profileHubs} />
        }
        {view === 'collection' && (
          <ProfileCollection profileCollection={profileCollectionReleases} />
        )}
      </Box>
    </Box>
  )
}

export default Profile
