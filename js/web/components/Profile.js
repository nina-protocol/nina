import { useEffect, useContext, useState, useMemo } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/system'
import Head from 'next/head'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
const Dots = dynamic(() => import('./Dots'))
const ReleaseTable = dynamic(() => import('./ReleaseTable'))
const ProfileHubs = dynamic(() => import('./ProfileHubs'))
const ProfileToggle = dynamic(() => import('./ProfileToggle'))

const findArtistNames = (releases) => {
  return releases.map((release) => release.metadata.properties.artist)
}

const Profile = ({ userId }) => {
  const {
    getUserCollectionAndPublished,
    releaseState,

    filterReleasesPublishedByUser,

    filterReleasesList,
  } = useContext(Release.Context)

  const { getHubsForUser, filterHubsForUser, hubState } = useContext(
    Hub.Context
  )

  const { resetQueueWithPlaylist } = useContext(Audio.Context)

  const [profilePublishedReleases, setProfilePublishedReleases] = useState([])
  const [profileCollectionReleases, setProfileCollectionReleases] = useState()
  const [profileHubs, setProfileHubs] = useState([])
  const [view, setView] = useState('releases')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [profileCollectionIds, setProfileCollectionIds] = useState(undefined)
  const [toggleView, setToggleView] = useState('releases')
  const [fetchingUser, setFetchingUser] = useState('fetching')
  const [fetchingReleases, setFetchingReleases] = useState('fetching')
  const [fetchingHubs, setFetchingHubs] = useState('fetching')
  const [fetchingCollection, setFetchingCollection] = useState('fetching')
  const [profileArtistData, setProfileArtistData] = useState([])
  const artistNames = useMemo(
    () => [...new Set(findArtistNames(profilePublishedReleases))],
    [profilePublishedReleases]
  )

  useEffect(() => {
    setFetchingUser('fetching')
    const getUserData = async (userId) => {
      await getHubsForUser(userId)
      const [collectionIds] = await getUserCollectionAndPublished(userId)
      setProfileCollectionIds(collectionIds)
    }
    if (userId) {
      setFetchingUser('fetched')
      getUserData(userId)
    }
  }, [userId])

  useEffect(() => {
    setFetchingReleases('fetching')
    setFetchingCollection('fetching')
    if (profileCollectionIds?.length > 0 && userId) {
      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
      const releases = filterReleasesPublishedByUser(userId)
      setProfilePublishedReleases(releases)
      setFetchingReleases('fetched')
      setFetchingCollection('fetched')
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    setFetchingHubs('fetching')
    const hubs = filterHubsForUser(userId)
    if (hubs) {
      setProfileHubs(hubs)
      setFetchingHubs('fetched')
    }
  }, [hubState])

  useEffect(() => {
    setProfileArtistData(artistNames)
  }, [])

  const releasesClickHandler = () => {
    setView('releases')
    setToggleView('releases')
  }
  const hubsClickHandler = () => {
    setView('hubs')
    setToggleView('hubs')
  }
  const collectionClickHandler = () => {
    setView('collection')
    setToggleView('collection')
  }

  console.log('artistNames', profileArtistData)

  const playAllHandler = (playlist) => {
    resetQueueWithPlaylist(
      playlist.map((release) => release.releasePubkey)
    ).then(() =>
      enqueueSnackbar(`Releases added to queue`, {
        variant: 'info',
      })
    )
  }

  const releaseTabs = ['', ' ', 'Artist', 'Title']

  return (
    <>
      <Head>
        <title>{`Nina: ${userId}'s Profile`}</title>
        <meta name="description" content={'Your profile on Nina.'} />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${userId ? `${userId}'s Hub` : ''}`}
        />
        <meta
          name="og:description"
          content={`All releases, Hubs, and collection belonging to ${userId}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${userId} on Nina`} />
        <meta
          name="twitter:description"
          content={`All releases, Hubs, and collection belonging to ${userId}`}
        />
        <meta name="twitter:image" content="/images/favicon.ico" />
        <meta name="og:image" content={'/images/favicon.ico'} />
        <meta property="og:title" content="iPhone" />
        <meta property="og:image" content={`/images/favicon.ico`} />
      </Head>

      <ResponsiveProfileContainer>
        <ResponsiveProfileHeaderContainer>
          <Box sx={{ maxWidth: '100%', textAlign: 'left' }}>
            {fetchingUser === 'fetching' && (
              <ResponsiveDotHeaderContainer>
                <Dots />
              </ResponsiveDotHeaderContainer>
            )}
            {fetchingUser === 'fetched' && profileArtistData.length === 0 && {userId}}
            {fetchingUser === 'fetched' && (
              <>
                <Typography sx={{pb:1}}>{`Profile: ${userId}`}</Typography>
                <Typography>{`Has published releases as ${profileArtistData.slice(0,-1).join(", ")+` and ${profileArtistData.slice(-1)}.`}`}</Typography>
              </>
            )}
          </Box>
        </ResponsiveProfileHeaderContainer>

        <Box sx={{ py: 1 }}>
          <ProfileToggle
            releaseClick={() => releasesClickHandler()}
            hubClick={() => hubsClickHandler()}
            collectionClick={() => collectionClickHandler()}
            isClicked={toggleView}
            onPlayReleases={() => playAllHandler(profilePublishedReleases)}
            onPlayCollection={() => playAllHandler(profileCollectionReleases)}
          />
        </Box>
        <ResponsiveProfileContentContainer>
          {view === 'releases' && (
            <>
              {fetchingReleases === 'fetching' && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchingReleases === 'fetched' &&
                profilePublishedReleases.length === 0 && (
                  <Box sx={{ p: 1, m: 1 }}>
                    No releases belong to this address
                  </Box>
                )}
              {fetchingReleases === 'fetched' && (
                <ReleaseTable
                  allReleases={profilePublishedReleases}
                  tableTabs={releaseTabs}
                />
              )}
            </>
          )}

          {view === 'collection' && (
            <>
              {fetchingCollection === 'fetching' && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchingCollection === 'fetched' && profileHubs.length === 0 && (
                <Box>No collection found at this address</Box>
              )}
              {fetchingCollection === 'fetched' && (
                <ReleaseTable
                  allReleases={profileCollectionReleases}
                  tableTabs={releaseTabs}
                />
              )}
            </>
          )}
          {view === 'hubs' && (
            <>
              {fetchingHubs === 'fetching' && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchingHubs === 'fetched' && profileHubs.length === 0 && (
                <Box>No Hubs belong to this address</Box>
              )}
              {fetchingHubs === 'fetched' && (
                <ProfileHubs profileHubs={profileHubs} />
              )}
            </>
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
  minWidth: '960px',
  maxWidth: '960px',
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

const ResponsiveProfileHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100%',
  minHeight: '115px',
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0,
    pb: 2,
    mb: 2,
    width: '100vw',
  },
}))

const ResponsiveProfileContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '50vh',
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

export default Profile
