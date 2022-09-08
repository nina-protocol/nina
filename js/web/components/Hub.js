import { useEffect, useMemo, useState, useContext } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { Box, Toolbar } from '@mui/material'
import dynamic from 'next/dynamic'

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
    hubContentState,
  } = useContext(Hub.Context)

  const { releaseState } = useContext(Release.Context)
  const [hubReleases, setHubReleases] = useState([])
  const [, setHubPosts] = useState([])
  const [releaseData, setReleaseData] = useState([])
  const [collaboratorsData, setCollaboratorsData] = useState([])
  const [view, setView] = useState('releases')
  const [clickedToggle, setClickedToggle] = useState('releases')
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
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
    setHubReleases(releases)
    setHubPosts(posts)
    setCollaboratorsData(collaborators)
  }, [hubContentState])

  useEffect(() => {
    const data = hubReleases.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      releaseMetadata.releasePubkey = hubRelease.release
      return releaseMetadata
    })
    setReleaseData(data)
  }, [releaseState, hubReleases])

  const releaseClickHandler = () => {
    setView("releases");
    setClickedToggle("releases")
  }

  const collaboratorClickHandler = () => {
    setView("collaborators")
    setClickedToggle('collaborators')
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
      {hubData && (
        <HubHeader
          hubImage={`${hubData?.json.image ? hubData.json.image : ''}`}
          hubName={`${
            hubData?.json.displayName ? hubData.json.displayName : ''
          }`}
          hubDescription={`${
            hubData?.json.hubDescription ? hubData.json.hubDescription : ''
          }`}
          hubUrl={`${
            hubData?.json.externalUrl ? hubData.json.externalUrl : ''
          }`}
          hubDate={`${hubData.createdAt ? hubData.createdAt : ''}`}
        />
      )}
      <HubToggle
        releaseClick={() => releaseClickHandler()}
        collaboratorClick={() => collaboratorClickHandler()}
        isReleaseClicked={clickedToggle}
        isCollaboratorClicked={clickedToggle}
      />
      <Box sx={{ height: '50vh', overflow: 'auto', mx: 'auto' }}>
        {view === 'releases' && <HubReleases hubReleases={releaseData} />}
        {view === 'collaborators' && (
          <HubCollaborators collabData={collaboratorsData} />
        )}
      </Box>
    </Box>
  )
}

export default HubComponent
