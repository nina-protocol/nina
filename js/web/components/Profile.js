import { useMemo, useEffect, useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import dynamic from 'next/dynamic'
import { Box } from '@mui/system'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'

const ProfileReleases = dynamic(() => import('./ProfileReleases'))
const ProfileHubs = dynamic(() => import('./ProfileHubs'))
const ProfileCollections = dynamic(() => import('./ProfileCollections'))
const ProfileToggle = dynamic(() => import('./ProfileToggle'))
const Profile = ({ userId }) => {
  const {
    getUserCollection,
    releaseState,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    getReleasesPublishedByUser,
    filterReleasesList
  } = useContext(Release.Context)

  const { getHubsForUser, filterHubsForUser, hubState } = useContext(
    Hub.Context
  )
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)
  const [profileReleases, setProfileReleases] = useState([])
  const [profileCollectionIds, setProfileCollectionIds] = useState([])
  const [profileCollectionReleases, setProfileCollectionReleases] = useState()
  const [profileHubs, setProfileHubs] = useState([])
  const [view, setView] = useState('releases')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    if (userId) {
      getReleasesPublishedByUser(userId)
      handleUserCollection(userId)
     getHubsForUser(userId)
    }
  }, [userId])


  useEffect(() => {
    if (userId && profileCollectionIds) {
        setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    const releases = filterReleasesPublishedByUser(userId)
    console.log('releases', releases)
    setProfileReleases(releases)
    console.log('profileReleases', profileReleases)
  }, [releaseState])

  useEffect(() => {
    const hubs = filterHubsForUser(userId)
    console.log('hubs', hubs)
    setProfileHubs(hubs)
  }, [hubState])


  const handleUserCollection = async (userId) => {
    console.log('handle')
    const collection = await getUserCollection(userId)
    setProfileCollectionIds(collection)
  }


  const handlePlay = (e, releasePubKey) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('releasePubKey', releasePubKey)
    if (isPlaying && track.releasePubKey === releasePubKey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubKey, true, true)
    }
  }
  const handleAddTrackToQueue = (e, releasePubKey) => {
    e.stopPropagation()
    e.preventDefault()
    addTrackToQueue(releasePubKey)
    enqueueSnackbar(`Track successfully added to the queue`)
  }

  return (
    <Box sx={{ width: '100%' }}>
        <Box sx={{font:'ultralight'}}>{userId}</Box>
      <ProfileToggle
        releaseClick={() => setView('releases')}
        hubClick={() => setView('hubs')}
        collectionClick={() => setView('collection')}
      />
      {view === 'releases' && (
        <ProfileReleases profileReleases={profileReleases} onPlay={(e) => handlePlay(e, e.target.id)} onQueue={(e) => handleAddTrackToQueue(e, e.target.id, e.target.key)}/>
      )}
      {view === 'hubs' && <ProfileHubs profileHubs={profileHubs} />}
      {view === 'collection' && (
        <>
        <ProfileCollections profileCollection={profileCollectionReleases}  onPlay={(e) => handlePlay(e, e.target.id)} onQueue={(e) => handleAddTrackToQueue(e, e.target.id, e.target.key)}/>
        </>
      )}
    </Box>
  )
}

export default Profile
