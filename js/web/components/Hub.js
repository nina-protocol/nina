import { useEffect, useMemo, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Box, } from '@mui/material'
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

  const {resetQueueWithPlaylist} = useContext(Audio.Context)
  const { enqueueSnackbar } = useSnackbar()

  const [hubReleases, setHubReleases] = useState([])
  const [releaseData, setReleaseData] = useState([])
  const [collaboratorsData, setCollaboratorsData] = useState([])
  const [view, setView] = useState('releases')
  const [fetchedHubInfo, setFetchedHubInfo] = useState(false)
  const [fetchedReleases, setFetchedReleases] = useState(false)
  const [fetchedCollaborators, setFetchedCollaborators] = useState(false)
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
    if (releases.length > 0) {
      setFetchedReleases(true)
    }
    if (releases.length === 0) {
      setFetchedReleases(false)
    }
    if (collaborators) {
      setFetchedCollaborators(true)
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
  }

  const collaboratorClickHandler = () => {
    setView('collaborators')
  }
  const playAllHandler = (playlist) => {
    resetQueueWithPlaylist(
      playlist.map((release) => release.releasePubkey)
    ).then(() =>
      enqueueSnackbar(`Releases added to queue`, {
        variant: 'info',
      })
    )
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
          {fetchedHubInfo && hubData ? (
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
            <ResponsiveDotHeaderContainer>
              <Dots />
            </ResponsiveDotHeaderContainer>
          )}
        </ResponsiveHubHeaderContainer>
        <HubToggle
          releaseClick={() => releaseClickHandler()}
          collaboratorClick={() => collaboratorClickHandler()}
          isClicked={view}
          onPlayReleases={() => playAllHandler(releaseData)}
        />
        <ResponsiveHubContentContainer sx={{ minHeight: '50vh' }}>
          {view === 'releases' && (
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
          {view === 'collaborators' && (
            <>
              {!fetchedCollaborators && (
                <ResponsiveDotContainer
                  sx={{
                    display: 'table-cell',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedCollaborators && !collaboratorsData && (
                <Box sx={{ my: 1 }}>No collaborators found in this Hub</Box>
              )}
              {fetchedCollaborators && (
                <HubCollaborators collabData={collaboratorsData} />
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
  minWidth: '960px',
  maxWidth: '960px',
  maxHeight: '60vh',
  webkitOverflowScrolling: 'touch',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop:"125px",
    maxHeight: '80vh'
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
  width: '960px',
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
