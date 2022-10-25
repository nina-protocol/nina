import { useEffect, useMemo, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import { Box, } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'

const Dots = dynamic(() => import('./Dots'))
const HubHeader = dynamic(() => import('./HubHeader'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const HubComponent = ({ hubPubkey }) => {
  const {
    getHub,
    hubState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    hubContentState,
    hubCollaboratorsState
  } = useContext(Hub.Context)

  const { releaseState } = useContext(Release.Context)

  const [hubReleases, setHubReleases] = useState(undefined)
  const [releaseData, setReleaseData] = useState(undefined)
  const [hubCollaborators, setHubCollaborators] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [fetched, setFetched] = useState({
    info: false,
    releases: false,
    collaborators: false,
  })
  const [views, setViews] = useState([
    { name: 'releases', visible: false },
    { name: 'collaborators', visible: true },
  ])
  const hubData = useMemo(() => {
    if (hubState[hubPubkey]) {
      setFetched({ ...fetched, info: true})
      return hubState[hubPubkey]
    } else {
      getHub(hubPubkey)
    }
  }, [hubState, hubPubkey])

  useEffect(() => {
    if (hubPubkey) {
      getHub(hubPubkey)
    }
  }, [hubPubkey])

  useEffect(() => {
    const [releases] = filterHubContentForHub(hubPubkey)
    setFetched({ ...fetched, releases: true})
    setHubReleases(releases)
  }, [hubContentState])

  useEffect(() => {
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    setFetched({ ...fetched, collaborators: true})
    setHubCollaborators(collaborators)
  }, [hubCollaboratorsState])

  useEffect(() => {
    let updatedView = views.slice()
    let viewIndex

    const data = hubReleases?.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      releaseMetadata.authority = releaseState.tokenData[hubRelease.release].authority
      releaseMetadata.releasePubkey = hubRelease.release
      return releaseMetadata
    })
    const sortedPublished = data?.sort((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date)
    })

    setReleaseData(sortedPublished)

    viewIndex = updatedView.findIndex((view) => view.name === 'releases')
    updatedView[viewIndex].playlist = releaseData
    setFetched({ ...fetched, release: true })
  }, [releaseState, hubReleases, views])

  useEffect(() => {
    let updatedView = views.slice()
    let viewIndex

    if (hubReleases?.length > 0) {
      setActiveView(0)
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].visible = true
      updatedView[viewIndex].playlist = hubReleases
    }
    if (
      hubReleases?.length === 0 &&
      fetched.releases &&
      hubCollaborators.length > 0
    ) {
      setActiveView(1)
    }
    setFetched({ ...fetched })
    setViews(updatedView)
  }, [hubReleases, hubCollaborators])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
  }

  const renderTables = (activeView) => {
    switch (activeView) {
      case undefined:
        return (
          <>
            <HubDotWrapper>
              <Box sx={{ width: '100%', margin: 'auto' }}>
                <Dots />
              </Box>
            </HubDotWrapper>
          </>
        )
      case 0:
        return (
          <>
            {fetched.releases && !releaseData && (
              <Box sx={{ my: 1 }}>No releases found in this Hub</Box>
            )}
            {fetched.releases && releaseData && (
              <ReusableTable
                tableType={'hubReleases'}
                items={releaseData}
                hasOverflow={true}
              />
            )}
          </>
        )
      case 1:
        return (
          <>
            {fetched.collaborators && !hubCollaborators && (
              <Box sx={{ my: 1 }}>No collaborators found in this Hub</Box>
            )}
            {fetched.collaborators && (
              <ReusableTable
                tableType={'hubCollaborators'}
                items={hubCollaborators}
                hasOverflow={true}
              />
            )}
          </>
        )
      default:
        break
    }
  }
  return (
    <>

      <HubContainer>
        <>{fetched.info && hubData && <HubHeader hubData={hubData} />}</>
        {fetched.info && hubData && (
          <HubTabWrapper>
            <TabHeader
              viewHandler={viewHandler}
              activeView={activeView}
              profileTabs={views}
              releaseData={hubReleases}
              type={'hubView'}
            />
          </HubTabWrapper>
        )}
            {!activeView === undefined && (
            <ProfileDotWrapper>
              <Box sx={{ margin: 'auto' }}>
                <Dots />
              </Box>
            </ProfileDotWrapper>
          )}
        <>{renderTables(activeView)}</>
      </HubContainer>
    </>
  )
}

const HubContainer = styled(Box)(({ theme }) => ({
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

const HubTabWrapper = styled(Box)(({ theme }) => ({
  py: 1,
  [theme.breakpoints.down('md')]: {
    marginTop: '0px',
  },
}))

const HubDotWrapper = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  height: '100%',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '47%',
    top: '53%',
  },
}))

export default HubComponent
