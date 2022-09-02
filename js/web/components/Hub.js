import { useContext, useEffect, useMemo, useState } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { Box, Toolbar } from '@mui/material'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import dynamic from 'next/dynamic'
import { useSnackbar } from 'notistack'
const HubHeader = dynamic(() => import('./HubHeader'))
const HubCollaborators = dynamic(() => import('./HubCollaborators'))
const HubToggle = dynamic(() => import('./HubToggle'))
const HubReleases = dynamic(() => import('./HubReleases'))

const HubComponent = ({ hubPubkey }) => {
  const {
    getHub,
    hubState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    hubCollaboratorsState,
    hubContentState,
  } = useContext(Hub.Context)
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)
  const { releaseState } = useContext(Release.Context)
  const [hubReleases, setHubReleases] = useState([])
  const [hubPosts, setHubPosts] = useState([])
  const [releaseData, setReleaseData] = useState([])
  const [collaboratorsData, setCollaboratorsData] = useState([])
  const [view, setView] = useState('')
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  console.log('hubData', hubData)

  useEffect(() => {
    getHub(hubPubkey)
    setHubReleases([])
    setHubPosts([])
    setCollaboratorsData([])
  }, [hubPubkey])

  useEffect(() => {
    const [releases, posts] = filterHubContentForHub(hubPubkey)
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    console.log('collaborators', collaborators)
    setHubReleases(releases)
    setHubPosts(posts)
    setCollaboratorsData(collaborators)
  }, [hubContentState])

  useEffect(() => {
    const data = hubReleases.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      releaseMetadata.releasePubKey = hubRelease.release
      return releaseMetadata
    })
    setReleaseData(data)
  }, [releaseState, hubReleases])

  console.log('releaseData', releaseData)

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
      {hubData && (
        <HubHeader
          hubImage={hubData.json.image || ''}
          hubName={hubData.json.displayName || ''}
          hubDescription={hubData.json.hubDescription || ''}
          hubUrl={hubData.json.externalUrl || ''}
          hubDate={hubData.createdAt}
        />
      )}
      <HubToggle
        releaseClick={() => setView('releases')}
        collaboratorClick={() => setView('collaborators')}
      />
      {view === 'releases' && (
        <HubReleases
          releases={releaseData}
          onPlay={(e) => handlePlay(e, e.target.id)}
        onQueue={(e) => handleAddTrackToQueue(e, e.target.id, e.target.key)}
          
        />
      )}
      {view === 'collaborators' && (
        <HubCollaborators collabData={collaboratorsData} />
      )}
    </Box>
  )
}

export default HubComponent
