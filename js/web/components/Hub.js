import { useEffect, useMemo, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'

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
    { name: 'releases', playlist: undefined, visible: false },
    { name: 'collaborators', playlist: undefined, visible: true },
  ])
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  useEffect(() => {
    if (hubPubkey) {
      getHub(hubPubkey)
      fetched.info = true
      setFetched({ ...fetched })
    }
  }, [hubPubkey])

  useEffect(() => {
    const [releases] = filterHubContentForHub(hubPubkey)
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    fetched.collaborators = true
    setHubReleases(releases)
    setHubCollaborators(collaborators)
  }, [hubContentState])

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
    fetched.releases = true
    setFetched({ ...fetched })
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
          hubData?.json.displayName ? `${hubData.json.displayName}'s Hub` : ''
        }`}</title>
        <meta
          name="description"
          content={`${hubData?.json.displayName}'s Hub on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            hubData?.json.displayName ? `${hubData.json.displayName}'s Hub` : ''
          }`}
        />
        <meta
          name="og:description"
          content={`${
            hubData?.json.displayName ? hubData?.json.displayName : ''
          }: ${
            hubData?.json.description ? hubData?.json.description : ''
          } \n Published via Nina Hubs.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${hubData?.json.displayName}'s Hub on Nina`}
        />
        <meta name="twitter:description" content={hubData?.json.description} />
        <meta name="twitter:image" content={hubData?.json.image} />
        <meta name="og:image" content={hubData?.json.image} />
      </Head>

      <ResponsiveHubContainer>
        <>
          {fetched.info && hubData && <HubHeader hubData={hubData} />}
        </>
        {fetched.info && hubData && (
          <ResponsiveTabContainer>
            <TabHeader
              viewHandler={viewHandler}
              isActive={activeView}
              profileTabs={views}
              releaseData={releaseData}
              type={'hubsView'}
            />
          </ResponsiveTabContainer>
        )}
        <ResponsiveHubContentContainer>
          {activeView === undefined && (
            <>
            <ResponsiveDotContainer>
              <Box sx={{width: '100%', margin: 'auto'}}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
            </>
           )} 
           
          {activeView === 0 && (
            <>
             {fetched.releases && !releaseData && (
                <Box sx={{ my: 1 }}>No releases found in this Hub</Box>
              )}
              {fetched.releases && releaseData && (
                <ReusableTable
                  tableType={'hubReleases'}
                  releases={releaseData}
                />
              )}
            </>
          )}
          {activeView === 1 && (
            <>
              {fetched.collaborators && !hubCollaborators && (
                <Box sx={{ my: 1 }}>No collaborators found in this Hub</Box>
              )}
              {fetched.collaborators && (
                <ReusableTable
                  tableType={'hubCollaborators'}
                  releases={hubCollaborators}
                />
              )}
            </>
          )}
        </ResponsiveHubContentContainer>
      </ResponsiveHubContainer>
    </>
  )
}

const ResponsiveHubContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  minWidth: theme.maxWidth,
  maxWidth: theme.maxWidth,
  height: '86vh',
  overflowY: 'hidden',
  margin: '75px auto 0px',
  webkitOverflowScrolling: 'touch',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop: '25px', 
    paddingTop: 0,
    minHeight: '100% !important',
    maxHeight: '80vh',
    overflow: 'scroll',
    marginLeft: 0,
  },
}))

const ResponsiveTabContainer = styled(Box)(({ theme }) => ({
  py:1,

  [theme.breakpoints.down('md')]: {
    marginTop: '0px'
  }
}))

const ResponsiveHubContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  width: theme.maxWidth,
  webkitOverflowScrolling: 'touch',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    padding: '0px 30px',
    height: '100vh',
    overflowY: 'unset',
    minHeight: '60vh',
  },
}))

const ResponsiveDotContainer = styled(Box)(({ theme }) => ({
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
