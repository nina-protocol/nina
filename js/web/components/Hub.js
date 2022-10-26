import { useEffect, useMemo, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'

const Dots = dynamic(() => import('./Dots'))
const HubHeader = dynamic(() => import('./HubHeader'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const HubComponent = ({ hubHandle, hubPubkey }) => {
  const {
    getHub,
    hubState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    hubContentState,
    hubCollaboratorsState
  } = useContext(Hub.Context)

  const { releaseState } = useContext(Release.Context)
  const { fetchedHubs, setFetchedHubs} = useContext(Nina.Context)
  const [hubReleases, setHubReleases] = useState(undefined)
  const [releaseData, setReleaseData] = useState(undefined)
  const [hubCollaborators, setHubCollaborators] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [fetched, setFetched] = useState({
    info: false,
    releases: false,
    collaborators: false,
  })

  const hasData = useMemo(() => {
    if (fetchedHubs.has(hubPubkey)) {
      return true
    }
    if (fetched.info && fetched.releases && fetched.collaborators) {
      setFetchedHubs(fetchedHubs.add(hubPubkey))
      return true
    }
    return false
  }, [fetched, fetchedHubs, hubPubkey])

  const [views, setViews] = useState([
    { name: 'releases', playlist: undefined, visible: false },
    { name: 'collaborators', playlist: undefined, visible: true },
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
      releaseMetadata.releasePubkey = hubRelease.release
      return releaseMetadata
    })
    setReleaseData(data)

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
    if (hubReleases?.length === 0 && fetched.releases && hubCollaborators.length > 0) {
      
      setActiveView(1)
    }
    setFetched({ ...fetched })
    setViews(updatedView)
  }, [hubReleases, hubCollaborators])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
  }

  return (
    <>
      <Head>
        <title>{`Nina: ${
          hubData?.data.displayName ? `${hubData.data.displayName}'s Hub` : ''
        }`}</title>
        <meta
          name="description"
          content={`${hubData?.data.displayName}'s Hub on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            hubData?.data.displayName ? `${hubData.data.displayName}'s Hub` : ''
          }`}
        />
        <meta
          name="og:description"
          content={`${
            hubData?.data.displayName ? hubData?.data.displayName : ''
          }: ${
            hubData?.data.description ? hubData?.data.description : ''
          } \n Published via Nina Hubs.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${hubData?.data.displayName}'s Hub on Nina`}
        />
        <meta name="twitter:description" content={hubData?.data.description} />
        <meta name="twitter:image" content={hubData?.data.image} />
        <meta name="og:image" content={hubData?.data.image} />
      </Head>

      <HubContainer>
        <>
          {hasData && hubData && <HubHeader hubData={hubData} />}
        </>
        {hasData && hubData && (
          <HubTabWrapper>
            <TabHeader
              viewHandler={viewHandler}
              isActive={activeView}
              profileTabs={views}
              releaseData={releaseData}
              type={'hubsView'}
            />
          </HubTabWrapper>
        )}
        <>
          {activeView === undefined && (
            <>
            <HubDotWrapper>
              <Box sx={{width: '100%', margin: 'auto'}}>
                <Dots />
              </Box>
            </HubDotWrapper>
            </>
           )} 
           
          {activeView === 0 && (
            <>
             {hasData && !releaseData && (
                <Box sx={{ my: 1 }}>No releases found in this Hub</Box>
              )}
              {hasData && releaseData && (
                <ReusableTable
                  tableType={'hubReleases'}
                  items={releaseData}
                />
              )}
            </>
          )}
          {activeView === 1 && (
            <>
              {hasData && !hubCollaborators && (
                <Box sx={{ my: 1 }}>No collaborators found in this Hub</Box>
              )}
              {hasData && (
                <ReusableTable
                  tableType={'hubCollaborators'}
                  items={hubCollaborators}
                />
              )}
            </>
          )}
        </>
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
  py:1,
  [theme.breakpoints.down('md')]: {
    marginTop: '0px'
  }
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
