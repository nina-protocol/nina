import { useEffect, useMemo, useState, useContext } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { Box, Toolbar } from '@mui/material'
import dynamic from 'next/dynamic'
import { styled } from '@mui/system'

const Dots = dynamic(() => import('./Dots'))
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
  const [fetchingHubInfo, setFetchingHubInfo] = useState('fetching')
  const [fetchingReleases, setFetchingReleases] = useState('fetching')
  const [fetchingCollaborators, setFetchingCollaborators] = useState('fetching')
  const [hubDescription, setHubDescription] = useState()
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  console.log('hubData', hubData)

  useEffect(() => {
    if (!hubPubkey) {
      setFetchingHubInfo('fetching')
    }
    getHub(hubPubkey)
    if (hubPubkey) {
      setFetchingHubInfo('fetched')
    }
  }, [hubPubkey])

  useEffect(() => {
    const [releases, posts] = filterHubContentForHub(hubPubkey)
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    setHubReleases(releases)
    setHubPosts(posts)
    setCollaboratorsData(collaborators)
    if (releases.length > 0) {
      setFetchingReleases('fetched')
    }
    if (releases.length === 0) {
      setFetchingReleases('fetching')
    }
    if (collaborators) {
      setFetchingCollaborators('fetched')
    }
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
    setView('releases')
    setClickedToggle('releases')
  }

  const collaboratorClickHandler = () => {
    setView('collaborators')
    setClickedToggle('collaborators')
  }
  return (
    <ResponsiveHubContainer>
      <ResponsiveHubHeaderContainer>
        {/* {fetchingHubInfo === 'fetched' && !hubData && (
        <Box>No Hub information available at this address</Box>
      )} */}
        {fetchingHubInfo === 'fetched' && hubData ? (
          <HubHeader
            hubImage={`${hubData?.json.image ? hubData.json.image : ''}`}
            hubName={`${
              hubData?.json.displayName ? hubData.json.displayName : ''
            }`}
            description={`${
              hubData?.json.description ? hubData.json.description : ''
            }`}
            hubUrl={`${
              hubData?.json.externalUrl ? hubData.json.externalUrl : ''
            }`}
            hubDate={`${hubData.createdAt ? hubData.createdAt : ''}`}
          />
        ) : (
          <Box sx={{my: 1,}}><Dots/></Box>
        )}
      </ResponsiveHubHeaderContainer>
      <HubToggle
        releaseClick={() => releaseClickHandler()}
        collaboratorClick={() => collaboratorClickHandler()}
        isReleaseClicked={clickedToggle}
        isCollaboratorClicked={clickedToggle}
      />
      <ResponsiveHubContentContainer sx={{ minHeight: '50vh' }}>
        {view === 'releases' && (
          <>
            {fetchingReleases === 'fetching' && (
              <Box><Dots /></Box>
            )}
            {fetchingReleases === 'fetched' && releaseData && (
              <HubReleases hubReleases={releaseData} />
            )}
          </>
        )}
        {view === 'collaborators' && (
          <>
            {fetchingCollaborators === 'fetching' && (
              <Box sx={{my:1 }}><Dots /></Box>
            )}
            {fetchingCollaborators === 'fetched' && !collaboratorsData && (
              <Box sx={{my:1}}>No collaborators found in this Hub</Box>
            )}
            {fetchingCollaborators === 'fetched' && (
              <HubCollaborators collabData={collaboratorsData} />
            )}
          </>
        )}
      </ResponsiveHubContentContainer>
    </ResponsiveHubContainer>
  )
}

const ResponsiveHubContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  minWidth:'960px',
  maxWidth: '960px',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    
  },
}))

const ResponsiveHubHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  px: 1,
  m: 1,
  minHeight: '115px',
  [theme.breakpoints.down('md')]:{
    width: '100vw'
  }
}))

const ResponsiveHubContentContainer = styled(Box)(({theme}) => ({
  minHeight:'50vh',
  width: '960px',
  [theme.breakpoints.down('md')]: {
    width: '100vw'
  }
}))
export default HubComponent
