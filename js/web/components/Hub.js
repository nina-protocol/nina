import { useEffect, useMemo, useState, useContext, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useRouter } from 'next/router'
const Dots = dynamic(() => import('./Dots'))
const HubHeader = dynamic(() => import('./HubHeader'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const HubComponent = ({ hubPubkey }) => {
  const tableContainerRef = useRef(null)
  const router = useRouter()
  const {
    getHub,
    hubState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    hubContentState,
    hubCollaboratorsState,
  } = useContext(Hub.Context)

  const { releaseState } = useContext(Release.Context)
  const {
    fetchedHubs,
    setFetchedHubs,
    getSubscriptionsForHub,
    subscriptionState,
    filterSubscriptionsForHub,
  } = useContext(Nina.Context)
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
    { name: 'releases', playlist: undefined, disabled: true, count: 0 },
    { name: 'collaborators', playlist: undefined, disabled: true, count: 0 },
    { name: 'followers', disabled: true, count: 0 },
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
    if (hubPubkey) {
      getHub(hubPubkey)
      getSubscriptionsForHub(hubPubkey)
    }
  }, [hubPubkey])

  useEffect(() => {
    setHubFollowers(filterSubscriptionsForHub(hubPubkey))
  }, [subscriptionState])

  useEffect(() => {
    let [releases] = filterHubContentForHub(hubPubkey)
    releases = releases.filter((release) => release.visible === true)
    setFetched({ ...fetched, releases: true })
    setHubReleases(releases)
  }, [hubContentState])

  useEffect(() => {
    const collaborators = filterHubCollaboratorsForHub(hubPubkey)
    setFetched({ ...fetched, collaborators: true })
    setHubCollaborators(collaborators)
  }, [hubCollaboratorsState])

  useEffect(() => {
    if (router.query.view) {
      const viewIndex = views.findIndex(
        (view) => view.name === router.query.view
      )
      setActiveView(viewIndex)
    }
  }, [router.query.view])

  useEffect(() => {
    let updatedView = views.slice()
    let viewIndex

    const data = hubReleases?.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      releaseMetadata.authority =
        releaseState.tokenData[hubRelease.release].authority
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
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = hubReleases.length
      updatedView[viewIndex].playlist = hubReleases
    }

    if (hubCollaborators?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collaborators')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = hubCollaborators.length
    }

    if (
      hubReleases?.length === 0 &&
      fetched.releases &&
      hubCollaborators.length > 0
    ) {
      setActiveView(1)
    }

    if (hubFollowers) {
      viewIndex = updatedView.findIndex((view) => view.name === 'followers')
      updatedView[viewIndex].count = hubFollowers.length
      updatedView[viewIndex].disabled = hubFollowers.length === 0
    }

    setFetched({ ...fetched })
    setViews(updatedView)
  }, [hubReleases, hubCollaborators, hubFollowers])

  useEffect(() => {
    if (!router.query.view) {
      const viewIndex = views.findIndex((view) => !view.disabled)
      setActiveView(viewIndex)
    }
  }, [router.query])

  const viewHandler = (event) => {
    event.stopPropagation()
    const index = parseInt(event.target.id)
    const activeViewName = views[index].name
    const hubHandle = hubState[hubPubkey]?.handle
    const newUrl = `/hubs/${hubHandle}?view=${activeViewName}`
    window.history.replaceState(
          { ...window.history.state, as: newUrl, url: newUrl },
          '',
          newUrl
        )
    setActiveView(index)
    tableContainerRef.current.scrollTo(0, 0)
  }

  const renderTables = (activeView) => {
    switch (activeView) {
      case 0:
        return (
          <>
            {hasData && releaseData && (
              <ReusableTable
                tableType={'hubReleases'}
                items={releaseData}
                hasOverflow={true}
                isActiveView={activeView === 0}
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
            {hasData && (
              <ReusableTable
                tableType={'hubCollaborators'}
                items={hubCollaborators}
                hasOverflow={true}
                isActiveView={activeView === 1}
              />
            )}
          </>
        )
      case 2:
        return (
          <>
            {hasData && (
              <ReusableTable
                tableType={'followers'}
                items={hubFollowers}
                hasOverflow={true}
                isActiveView={activeView === 2}
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
        <>{hasData && hubData && <HubHeader hubData={hubData} />}</>
        {hasData && hubData && (
          <HubTabWrapper>
            <TabHeader
              viewHandler={viewHandler}
              activeView={activeView}
              profileTabs={views}
              releaseData={releaseData}
              type={'hubView'}
            />
          </HubTabWrapper>
        )}

        {!hasData && (
          <HubDotWrapper>
            <Box sx={{ width: '100%', margin: 'auto' }}>
              <Dots />
            </Box>
          </HubDotWrapper>
        )}
        <HubsTableContainer ref={tableContainerRef}>
          {renderTables(activeView)}
        </HubsTableContainer>
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
  paddingTop: 1,
}))

const HubsTableContainer = styled(Box)(({ theme }) => ({
  paddingBottom: '100px',
  overflowY: 'auto',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '100px',
    overflow: 'scroll',
  },
}))

const HubDotWrapper = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '47%',
    top: '53%',
  },
}))

export default HubComponent
