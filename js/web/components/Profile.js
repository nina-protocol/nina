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

  const { resetQueueWithPlaylist } = useContext(Audio.Context)

  const [profilePublishedReleases, setProfilePublishedReleases] = useState(undefined)
  const [profileCollectionReleases, setProfileCollectionReleases] = useState(undefined)
  const [profileHubs, setProfileHubs] = useState(undefined)
  const [activeView, setActiveView] = useState('0')
  const { enqueueSnackbar } = useSnackbar()
  const [profileCollectionIds, setProfileCollectionIds] = useState(undefined)
  const [toggleView, setToggleView] = useState(0)
  const [fetchedUser, setFetchedUser] = useState(false)
  const [fetchedReleases, setFetchedReleases] = useState(false)
  const [fetchedHubs, setFetchedHubs] = useState(false)
  const [fetchedCollection, setFetchedCollection] = useState(false)

  const artistNames = useMemo(
    () => {
      if (profilePublishedReleases?.length > 0) {
          return [
          ...new Set(
            profilePublishedReleases?.map(
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
    const getUserData = async (profilePubkey) => {
      await getHubsForUser(profilePubkey)
      const [collectionIds] = await getUserCollectionAndPublished(profilePubkey)
      setProfileCollectionIds(collectionIds)
    }
    if (profilePubkey) {
      setFetchedUser(true)
      getUserData(profilePubkey)
    }
  }, [profilePubkey])

  useEffect(() => {
    setFetchedReleases(false)
    setFetchedCollection(false)
    if (profileCollectionIds?.length > 0 && profilePubkey) {
      setProfileCollectionReleases(filterReleasesList(profileCollectionIds))
      const releases = filterReleasesPublishedByUser(profilePubkey)
      setProfilePublishedReleases(releases)
      setFetchedReleases(true)
      setFetchedCollection(true)
    }
  }, [releaseState, profileCollectionIds])

  useEffect(() => {
    setFetchedHubs(false)
    const hubs = filterHubsForUser(profilePubkey)
    if (hubs?.length > 0) {
      setProfileHubs(hubs)
      setFetchedHubs(true)
    }
  }, [hubState])

  const playAllHandler = (playlist) => {
    resetQueueWithPlaylist(
      playlist.map((release) => release.releasePubkey)
    ).then(() =>
      enqueueSnackbar(`Releases added to queue`, {
        variant: 'info',
      })
    )
  }

  const viewHandler = (id) => {
    console.log('e.target.id', id)
    setActiveView(id)
    setToggleView(id)
    console.log('activeView', activeView)
  }

  const releaseTabs = ['', '', 'Artist', 'Title']
  const hubTabs = ['', 'Artist', 'Description']
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
            {!fetchedUser && (
              <ResponsiveDotHeaderContainer>
                <Dots />
              </ResponsiveDotHeaderContainer>
            )}
            {fetchedUser && (
                <Typography>
                  {truncateAddress(profilePubkey)}
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
            onToggleClick={(e) => viewHandler(e.target.id)}
            isClicked={toggleView}
            onPlayReleases={() => playAllHandler(profilePublishedReleases)}
            onPlayCollection={() => playAllHandler(profileCollectionReleases)}
          />
        </Box>
        <ResponsiveProfileContentContainer>
          {activeView === '0' && (
            <>
              {!fetchedReleases && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedReleases &&
                profilePublishedReleases?.length < 1 && (
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

          {activeView === '1' && (
            <>
              {!fetchedCollection && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedCollection  && profileHubs === undefined && (
                <ResponsiveDotContainer>No collection found at this address</ResponsiveDotContainer>
              )}
              {fetchedCollection  && (
                <ProfileReleaseTable
                  allReleases={profileCollectionReleases}
                  tableCategories={releaseTabs}
                />
              )}
            </>
          )}
          {activeView === '2' && (
            <>
              {!fetchedHubs  && (
                <ResponsiveDotContainer>
                  <Dots />
                </ResponsiveDotContainer>
              )}
              {fetchedHubs && profileHubs === undefined && (
                <ResponsiveDotContainer>No Hubs belong to this address</ResponsiveDotContainer>
              )}
              {fetchedHubs  && (
                <ProfileHubs profileHubs={profileHubs} tableCategories={hubTabs} />
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

const ResponsiveProfileDetailHeaderContainer = styled(Box)(({theme}) => ({
  maxWidth: '100%', 
  textAlign: 'left',
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
