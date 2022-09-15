import { useEffect, useContext, useState, useMemo } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
import { useSnackbar } from 'notistack'

const Dots = dynamic(() => import('./Dots'))
const ProfileReleaseTable = dynamic(() => import('./ProfileReleaseTable'))
const ProfileHubs = dynamic(() => import('./ProfileHubs'))
const ProfileToggle = dynamic(() => import('./ProfileToggle'))

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
  const [fetchedUser, setFetchedUser] = useState(false)
  const [fetchedReleases, setFetchedReleases] = useState(false)
  const [fetchedHubs, setFetchedHubs] = useState(false)
  const [fetchedCollection, setFetchedCollection] = useState(false)
  // const [profileArtistData, setProfileArtistData] = useState([])

  const artistNames = useMemo(
    () => {
      if (profilePublishedReleases.length > 0) {
          return [
          ...new Set(
            profilePublishedReleases.map(
              (release) => release.metadata.properties.artist
            )
          ),
        ] 
      }
  },
    [profilePublishedReleases]
  )

  useEffect(() => {
    setFetchedUser(false)
    const getUserData = async (userId) => {
      await getHubsForUser(userId)
      const [collectionIds] = await getUserCollectionAndPublished(userId)
      setProfileCollectionIds(collectionIds)
    }
    if (userId) {
      setFetchedUser(true)
      getUserData(userId)
    }
  }, [userId])

  useEffect(() => {
    setFetchedReleases(false)
    setFetchedCollection(false)
    if (profileCollectionIds?.length > 0 && userId) {
      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
      const releases = filterReleasesPublishedByUser(userId)
      setProfilePublishedReleases(releases)
      setFetchedReleases(true)
      setFetchedCollection(true)
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    setFetchedHubs(false)
    const hubs = filterHubsForUser(userId)
    if (hubs) {
      setProfileHubs(hubs)
      setFetchedHubs(true)
    }
  }, [hubState])


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
          <ResponsiveProfileDetailHeaderContainer>
            {!fetchedUser && (
              <ResponsiveDotHeaderContainer>
                <Dots />
              </ResponsiveDotHeaderContainer>
            )}
            {fetchedUser && (
                <Typography>
                  {truncateAddress(userId)}
                </Typography>
              ) 
            }

            {fetchedUser && artistNames?.length > 0 && (
              <Box>
                {`Publishes as ${artistNames?.map(name => name).join(', ')}`}
              </Box>
            )}
          </ResponsiveProfileDetailHeaderContainer>
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
              {!fetchedReleases && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedReleases &&
                profilePublishedReleases.length === 0 && (
                  <ResponsiveDotContainer>
                    No releases belong to this address
                  </ResponsiveDotContainer>
                )}
              {fetchedReleases && (
                <ProfileReleaseTable
                  allReleases={profilePublishedReleases}
                  tableCategories={releaseTabs}
                />
              )}
            </>
          )}

          {view === 'collection' && (
            <>
              {!fetchedCollection && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedCollection  && profileHubs.length === 0 && (
                <ResponsiveDotContainer>No collection found at this address</ResponsiveDotContainer>
              )}
              {fetchedCollection  && (
                <ProfileReleaseTable
                  allReleases={profileCollectionReleases}
                  tableTabs={releaseTabs}
                />
              )}
            </>
          )}
          {view === 'hubs' && (
            <>
              {!fetchedHubs  && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedHubs && profileHubs.length === 0 && (
                <ResponsiveDotContainer>No Hubs belong to this address</ResponsiveDotContainer>
              )}
              {fetchedHubs  && (
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

const ResponsiveProfileDetailHeaderContainer = styled(Box)(({theme}) => ({
  maxWidth: '100%', textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
  }
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
  minHeight: '115px',
  [theme.breakpoints.down('md')]: {

    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
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
