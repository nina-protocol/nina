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
    hubCollaboratorsState,
  } = useContext(Hub.Context)

  const { releaseState } = useContext(Release.Context)
  const { fetchedHubs, setFetchedHubs, getSubscriptionsForHub, subscriptionState, filterSubscriptionsForHub } = useContext(Nina.Context)
  const [hubReleases, setHubReleases] = useState(undefined)
  const [releaseData, setReleaseData] = useState(undefined)
  const [hubCollaborators, setHubCollaborators] = useState(undefined)
  const [hubFollowers, setHubFollowers] = useState(undefined)
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
    { name: 'releases', playlist: undefined, disabled: false },
    { name: 'collaborators', playlist: undefined, disabled: true },
    { name: 'followers', disabled: true },
  ])

  const hubData = useMemo(() => {
    if (hubState[hubPubkey]) {
      setFetched({ ...fetched, info: true })
      return hubState[hubPubkey]
    } else {
      getHub(hubPubkey)
      getSubscriptionsForHub(hubPubkey)
    }
  }, [hubState, hubPubkey])

  useEffect(() => {
    setHubFollowers(filterSubscriptionsForHub(hubPubkey))
    console.log('hubFollowers :>> ', hubFollowers);
  }, [subscriptionState])

  useEffect(() => {
    const [releases] = filterHubContentForHub(hubPubkey)
    setFetched({ ...fetched, releases: true })
    setHubReleases(releases)
  }, [hubContentState])

  useEffect(() => {
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    setFetched({ ...fetched, collaborators: true })
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
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].playlist = hubReleases
    }

    if (hubCollaborators?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collaborators')
      updatedView[viewIndex].disabled = false
    }

    if (
      hubReleases?.length === 0 &&
      fetched.releases &&
      hubCollaborators.length > 0
    ) {
      setActiveView(1)
    }
    console.log('hubFollowers :>> ', hubFollowers);
    if (hubFollowers?.length > 0) {
      console.log('YES');
      viewIndex = updatedView.findIndex((view) => view.name === 'followers')
      updatedView[viewIndex].disabled = false
    }

    setFetched({ ...fetched })
    setViews(updatedView)
  }, [hubReleases, hubCollaborators, hubFollowers])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
  }

  return (
    <>
      <HubContainer>
        <>{hasData && hubData && <HubHeader hubData={hubData} />}</>
        {hasData && hubData && (
          <HubTabWrapper>
            <TabHeader
              viewHandler={viewHandler}
              isActive={activeView}
              profileTabs={views}
              releaseData={releaseData}
              type={'hubsView'}
              followersCount={hubFollowers?.length}
            />
          </HubTabWrapper>
        )}
        <>
          {activeView === undefined && (
            <>
              <HubDotWrapper>
                <Box sx={{ width: '100%', margin: 'auto' }}>
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
                <ReusableTable tableType={'hubReleases'} items={releaseData} />
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
          {activeView === 2 && (
            <>
              {hasData && !hubCollaborators && (
                <Box sx={{ my: 1 }}>No followers found in this Hub</Box>
              )}
              {hasData && (
                <ReusableTable
                  tableType={'followers'}
                  items={hubFollowers}
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
