import { useEffect, useMemo, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'

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

  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { enqueueSnackbar } = useSnackbar()

  const [hubReleases, setHubReleases] = useState(undefined)
  const [releaseData, setReleaseData] = useState(undefined)
  const [collaboratorsData, setCollaboratorsData] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [toggleView, setToggleView] = useState(0)
  const [fetchedHubInfo, setFetchedHubInfo] = useState(false)
  const [fetchedReleases, setFetchedReleases] = useState(false)
  const [fetchedCollaborators, setFetchedCollaborators] = useState(false)
  const [views, setViews] = useState([
    { name: 'releases', playlist: null, visible: true },
    { name: 'collaborators', playlist: null, visible: true },
  ])
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  useEffect(() => {
    if (!hubPubkey) {
      setFetchedHubInfo(false)
    }
    getHub(hubPubkey)
    if (hubPubkey) {
      setFetchedHubInfo(true)
    }
  }, [hubPubkey])

  useEffect(() => {
    const [releases] = filterHubContentForHub(hubPubkey)
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    setHubReleases(releases)
    setCollaboratorsData(collaborators)
    let updatedView = views.slice()
    let viewIndex;
    if (releases.length > 0) {
      setActiveView(0)
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].visible = true
      updatedView[viewIndex].playlist = releases
      setFetchedReleases(true)
    }
    if (releases.length === 0) {
      setActiveView(1)
      setFetchedReleases(false)
    }
    if (collaborators) {
      setFetchedCollaborators(true)
    }
    setViews(updatedView)
  }, [hubContentState])

  useEffect(() => {
    let updatedView = views.slice()
    let viewIndex;
    const data = hubReleases?.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      releaseMetadata.releasePubkey = hubRelease.release
      return releaseMetadata
    })
    setReleaseData(data)
    viewIndex = updatedView.findIndex((view) => view.name === 'releases')
    updatedView[viewIndex].playlist = releaseData
  }, [releaseState, hubReleases,views])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(parseInt(index))
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
        <ResponsiveHubHeaderContainer>
          {!fetchedHubInfo && (
            <ResponsiveDotHeaderContainer>
              <Dots />
            </ResponsiveDotHeaderContainer>
          )}
          {fetchedHubInfo && hubData && (
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
          )}
        </ResponsiveHubHeaderContainer>
        <Box sx={{ py: 1 }}>
          <HubToggle
            viewHandler={viewHandler}
            isActive={activeView}
            hubTabs={views}
            releaseData={releaseData}
          />
        </Box>
        <ResponsiveHubContentContainer>
          {activeView === 0 && (
            <>
              {!fetchedReleases && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedReleases && releaseData && (
                <HubReleases hubReleases={releaseData} />
              )}
            </>
          )}
          {activeView === 1 && (
            <>
              {!fetchedCollaborators && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedCollaborators && !collaboratorsData && (
                <Box sx={{ my: 1 }}>No collaborators found in this Hub</Box>
              )}
              {fetchedCollaborators && (
                <HubCollaborators collaboratorData={collaboratorsData} />
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
  maxHeight: '60vh',
  webkitOverflowScrolling: 'touch',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop: '125px',
    maxHeight: '80vh',
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
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

const ResponsiveHubContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  width: theme.maxWidth,
  webkitOverflowScrolling: 'touch',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '60vh',
  },
}))

const ResponsiveDotContainer = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  position: 'absolute',
  left: '50%',
  top: '50%',
  display: 'table-cell',
  textAlign: 'center',
  verticalAlign: 'middle',
  display: 'table-cell',
  textAlign: 'center',
  verticalAlign: 'middle',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '47%',
    top: '53%',
  },
}))

const ResponsiveDotHeaderContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '20%',
  fontSize: '80px',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '13%',
  },
}))
export default HubComponent
