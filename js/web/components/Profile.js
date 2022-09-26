import { useEffect, useContext, useState, useMemo } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'

const Dots = dynamic(() => import('./Dots'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const Profile = ({ profilePubkey }) => {
  const {
    getUserCollectionAndPublished,
    releaseState,
    filterReleasesPublishedByUser,
    filterReleasesList,
  } = useContext(Release.Context)

  const { getHubsForUser, filterHubsForUser, hubState } = useContext(
    Hub.Context
  )

  const [profilePublishedReleases, setProfilePublishedReleases] =
    useState(undefined)
  const [profileCollectionReleases, setProfileCollectionReleases] =
    useState(undefined)
  const [profileHubs, setProfileHubs] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [profileCollectionIds, setProfileCollectionIds] = useState(undefined)
  const [fetched, setFetched] = useState({
    user: false,
    releases: false,
    collection: false,
    hubs: false,
  })
  const [views, setViews] = useState([
    { name: 'releases', playlist: undefined, visible: false },
    { name: 'collection', playlist: undefined, visible: false },
    { name: 'hubs', playlist: null, visible: false },
  ])

  const artistNames = useMemo(() => {
    if (profilePublishedReleases?.length > 0) {
      return [
        ...new Set(
          profilePublishedReleases?.map(
            (release) => release.metadata.properties.artist
          )
        ),
      ]
    }
  }, [profilePublishedReleases])

  useEffect(() => {
    const getUserData = async (profilePubkey) => {
      await getHubsForUser(profilePubkey)
      const [collectionIds, publishedIds] = await getUserCollectionAndPublished(
        profilePubkey
      )
      setProfileCollectionIds(collectionIds)
    }

    getUserData(profilePubkey)
    fetched.user = true
  }, [profilePubkey])

  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()

    if (profilePubkey) {
      const releases = filterReleasesPublishedByUser(profilePubkey)
      setProfilePublishedReleases(releases)

      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].playlist = releases

        fetched.releases = true
        setFetched({
          ...fetched,
        })
  

      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))

      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].playlist = filterReleasesList(profileCollectionIds)
   
        fetched.collection = true
        setFetched({
          ...fetched,
        })
  

      const hubs = filterHubsForUser(profilePubkey)

      setProfileHubs(hubs)
        fetched.hubs = true
        setFetched({
          ...fetched,
        })
    }

    setViews(updatedView)
  }, [ profileCollectionIds, releaseState])

  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()

    if (profilePublishedReleases?.length > 0 && fetched.releases) {
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].visible = true
    }
    if (profileCollectionReleases?.length > 0 && fetched.collection) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].visible = true
    }

    if (profileHubs?.length > 0 && fetched.hubs) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].visible = true
    }
    setViews(updatedView)
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs])

  useEffect(() => {
    if (profilePublishedReleases?.length > 0) {
      setActiveView(0)
    }
    if (
      profilePublishedReleases?.length === 0 &&
      profileCollectionReleases?.length > 0
    ) {
      setActiveView(1)
    }
    if (
      fetched.collection &&
      fetched.releases &&
      fetched.hubs &&
      profilePublishedReleases?.length === 0 &&
      profileCollectionReleases?.length === 0 &&
      profileHubs?.length > 0
    ) {
      setActiveView(2)
    }
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
    console.log('index', index)
  }

  return (
    <>
      <Head>
        <title>{`Nina: ${profilePubkey}'s Profile`}</title>
        <meta name="description" content={'Your profile on Nina.'} />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${profilePubkey ? `${profilePubkey}'s Hub` : ''}`}
        />
        <meta
          name="og:description"
          content={`All releases, Hubs, and collection belonging to ${profilePubkey}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${profilePubkey} on Nina`} />
        <meta
          name="twitter:description"
          content={`All releases, Hubs, and collection belonging to ${profilePubkey}`}
        />
        <meta name="twitter:image" content="/images/favicon.ico" />
        <meta name="og:image" content={'/images/favicon.ico'} />
        <meta property="og:title" content="iPhone" />
        <meta property="og:image" content={`/images/favicon.ico`} />
      </Head>

      <ResponsiveProfileContainer>
        <ResponsiveProfileHeaderContainer>
          <ResponsiveProfileDetailHeaderContainer>
       
            {fetched.user && profilePubkey && (
              <>
                <Typography>{truncateAddress(profilePubkey)}</Typography>
              </>
            )}
            {fetched.user && artistNames?.length > 0 && (
              <Box>
                {`Publishes as ${artistNames?.map((name) => name).join(', ')}`}
              </Box>
            )}
      
          </ResponsiveProfileDetailHeaderContainer>
        </ResponsiveProfileHeaderContainer>
        {profilePublishedReleases?.length > 0 &&
          profileCollectionReleases?.length > 0 &&
          profileHubs?.length > 0 &&
          fetched.user && (
            <Box sx={{ py: 1 }}>
              <TabHeader
                viewHandler={viewHandler}
                isActive={activeView}
                profileTabs={views}
              />
            </Box>
          )}

        <ResponsiveProfileContentContainer>
          {activeView === undefined && (
            <ResponsiveDotContainer>
              <Dots />
            </ResponsiveDotContainer>
          )}
          {activeView === 0 && (
            <>
              {!fetched.releases &&  (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetched.releases && profilePublishedReleases.length === 0 && (
                <Box>No releases belong to this address</Box>
              )}
              {fetched.releases && profilePublishedReleases.length > 0 && (
                <ReusableTable
                  tableType={'profilePublishedReleases'}
                  releases={profilePublishedReleases}
                />
              )}
            </>
          )}

          {activeView === 1 && (
            <>
              {!fetched.collection && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetched.collection && profileCollectionReleases.length === 0 && (
                <Box>No collection found at this address</Box>
              )}
              {fetched.collection && profileCollectionReleases.length > 0 && (
                <ReusableTable
                  tableType={'profileCollectionReleases'}
                  releases={profileCollectionReleases}
                />
              )}
            </>
          )}
          {activeView === 2 && (
            <>
              {!fetched.hubs && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetched.hubs && profileHubs.length === 0 && (
                <Box>No Hubs belong to this address</Box>
              )}
              {fetched.hubs && profileHubs.length > 0 && (
                <ReusableTable
                  tableType={'profileHubs'}
                  releases={profileHubs}
                />
              )}
            </>
          )}

          {activeView === 3 && (
            <ReusableTable
              tableType={'profilePublishedReleases'}
              releases={profilePublishedReleases}
            />
          )}
        </ResponsiveProfileContentContainer>
      </ResponsiveProfileContainer>
    </>
  )
}

const ResponsiveProfileContainer = styled(Box)(({ theme }) => ({
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

const ResponsiveProfileDetailHeaderContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
}))

const ResponsiveProfileHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100vw',
  minHeight: '100px',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
  },
}))

const ResponsiveProfileContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '50vh',
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

export default Profile
