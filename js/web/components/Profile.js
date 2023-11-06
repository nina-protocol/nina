import { useEffect, useContext, useState, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import IdentityVerification from '@nina-protocol/nina-internal-sdk/esm/IdentityVerification'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import onboardingCodeWhitelist from '@nina-protocol/nina-internal-sdk/src/utils/onboardingCodeWhitelist'

import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Balance from './Balance'
const { getImageFromCDN, loader } = imageManager

const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))
const Subscribe = dynamic(() => import('./Subscribe'))
const NewProfileCtas = dynamic(() => import('./NewProfileCtas'))

const Profile = ({ profilePubkey }) => {
  const { wallet } = useContext(Wallet.Context)
  const router = useRouter()
  const walletPubkey = wallet?.publicKey?.toBase58()
  const tableContainerRef = useRef(null)
  const {
    getUserCollectionAndPublished,
    collectRoyaltyForRelease,
    fetchedUserProfileReleases,
    filterReleasesUserCollection,
    filterReleasesPublishedByUser,
    pendingReleases,
  } = useContext(Release.Context)
  const { getHubsForUser, fetchedHubsForUser, filterHubsForUser } = useContext(
    Hub.Context
  )
  const {
    getSubscriptionsForUser,
    filterSubscriptionsForUser,
    subscriptionState,
    fetchedProfiles,
    setFetchedProfiles,
    displayNameForAccount,
    getVerificationsForUser,
    verificationState,
    displayImageForAccount,
  } = useContext(Nina.Context)

  const isAdmin = onboardingCodeWhitelist.includes(walletPubkey)
  const [profilePublishedReleases, setProfilePublishedReleases] =
    useState(undefined)
  const [profileCollectionReleases, setProfileCollectionReleases] =
    useState(undefined)
  const [profileHubs, setProfileHubs] = useState(undefined)
  const [activeView, setActiveView] = useState(undefined)
  const [profileSubscriptions, setProfileSubscriptions] = useState()
  const [profileSubscriptionsTo, setProfileSubscriptionsTo] = useState()
  const [profileSubscriptionsFrom, setProfileSubscriptionsFrom] = useState()
  const [profileVerifications, setProfileVerifications] = useState([])

  const [inDashboard, setInDashboard] = useState(false)
  const [inCollection, setInCollection] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [views, setViews] = useState([
    { name: 'releases', playlist: undefined, disabled: true, count: 0 },
    { name: 'collection', playlist: undefined, disabled: true, count: 0 },
    { name: 'hubs', playlist: null, disabled: true, count: 0 },
    { name: 'followers', playlist: null, disabled: true, count: 0 },
    { name: 'following', playlist: null, disabled: true, count: 0 },
  ])

  const profileImage = useMemo(
    () => displayImageForAccount(profilePubkey),
    [profilePubkey, verificationState]
  )

  const hasData = useMemo(() => {
    if (fetchedProfiles.has(profilePubkey)) {
      return true
    }
    if (fetched) {
      setFetchedProfiles(new Set([...fetchedProfiles, profilePubkey]))
      return true
    }
  }, [fetchedProfiles, fetched, profilePubkey])

  useEffect(() => {
    getUserData(profilePubkey)
  }, [profilePubkey])

  useEffect(() => {
    if (wallet.connected && profilePubkey === walletPubkey) {
      setInDashboard(true)
      setInCollection(true)
    }
  }, [wallet, profilePubkey])

  useEffect(() => {
    if (!activeView) {
      if (router.query.view) {
        const viewIndex = views.findIndex(
          (view) => view.name === router.query.view
        )
        setActiveView(viewIndex)
      }
      if (!router.query.view && fetched) {
        const viewIndex = views.findIndex((view) => !view.disabled)
        setActiveView(viewIndex === -1 ? undefined : viewIndex)
      }
    }
  }, [router.query, views, fetched])

  useEffect(() => {
    const to = []
    const from = []
    if (profileSubscriptions) {
      profileSubscriptions.forEach((sub) => {
        if (sub.to.publicKey === profilePubkey) {
          to.push(sub)
        } else if (sub.from.publicKey === profilePubkey) {
          from.push(sub)
        }
      })
      setProfileSubscriptionsTo(to)
      setProfileSubscriptionsFrom(from)
    }
  }, [profileSubscriptions])

  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()
    if (profilePublishedReleases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = profilePublishedReleases.length
    }
    if (profileCollectionReleases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = profileCollectionReleases.length
    }
    if (profileHubs?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = profileHubs.length
    }
    if (profileSubscriptionsTo?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'followers')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = profileSubscriptionsTo?.length
    }
    if (profileSubscriptionsFrom?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'following')
      updatedView[viewIndex].disabled = false
      updatedView[viewIndex].count = profileSubscriptionsFrom?.length
    }
    if (inDashboard) {
      updatedView.forEach((view) => {
        view.disabled = false
      })
    }
    setViews(updatedView)
  }, [
    profilePublishedReleases,
    profileCollectionReleases,
    profileHubs,
    profileSubscriptionsTo,
    profileSubscriptionsFrom,
  ])

  useEffect(() => {
    let filteredCollection
    if (fetchedUserProfileReleases[profilePubkey]?.collected) {
      filteredCollection = filterReleasesUserCollection(profilePubkey)?.sort(
        (a, b) => {
          return (
            new Date(b.metadata.collectedDate) -
            new Date(a.metadata.collectedDate)
          )
        }
      )
      setProfileCollectionReleases(filteredCollection)
    } else {
      setProfileCollectionReleases([])
    }
  }, [fetchedUserProfileReleases, profilePubkey])

  useEffect(() => {
    let filteredReleases
    if (fetchedUserProfileReleases[profilePubkey]?.published) {
      filteredReleases = filterReleasesPublishedByUser(profilePubkey)?.sort(
        (a, b) => {
          return (
            new Date(b.metadata.properties.date) -
            new Date(a.metadata.properties.date)
          )
        }
      )
      setProfilePublishedReleases(filteredReleases)
    } else {
      setProfilePublishedReleases([])
    }
  }, [fetchedUserProfileReleases, profilePubkey])

  useEffect(() => {
    setProfileSubscriptions(filterSubscriptionsForUser(profilePubkey))
  }, [subscriptionState])

  useEffect(() => {
    if (fetchedHubsForUser.has(profilePubkey)) {
      setProfileHubs(filterHubsForUser(profilePubkey))
    } else {
      setProfileHubs([])
    }
  }, [fetchedHubsForUser])

  useEffect(() => {
    if (verificationState[profilePubkey]) {
      setProfileVerifications(verificationState[profilePubkey])
    }
  }, [verificationState])

  const getUserData = async () => {
    try {
      await getHubsForUser(profilePubkey)
      const [collected, published] = await getUserCollectionAndPublished(
        profilePubkey,
        true
      )

      await getSubscriptionsForUser(profilePubkey)
      await getVerificationsForUser(profilePubkey)

      let viewIndex
      let updatedView = views.slice()

      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].playlist = published

      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].playlist = collected
      setFetched(true)
    } catch (err) {
      console.warn(err)
    }
  }

  const viewHandler = (event) => {
    event.stopPropagation()
    const index = parseInt(event.target.id)
    const activeViewName = views[index].name
    const path = router.pathname.includes('dashboard')
      ? 'dashboard'
      : `profiles/${profilePubkey}`

    const newUrl = `/${path}?view=${activeViewName}`
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      '',
      newUrl
    )
    setActiveView(index)
    tableContainerRef.current.scrollTo(0, 0)
  }

  const renderTables = (activeView, inDashboard) => {
    switch (activeView) {
      case 0:
        return (
          <>
            {inDashboard && profilePublishedReleases?.length === 0 ? (
              <NewProfileCtas
                activeViewIndex={activeView}
                profilePubkey={profilePubkey}
              />
            ) : (
              <ReusableTable
                tableType={'profilePublishedReleases'}
                items={profilePublishedReleases}
                hasOverflow={true}
                inDashboard={inDashboard}
                dashboardPublicKey={profilePubkey}
                collectRoyaltyForRelease={collectRoyaltyForRelease}
                refreshProfile={getUserData}
              />
            )}
          </>
        )
      case 1:
        return (
          <>
            {inDashboard && profileCollectionReleases?.length === 0 ? (
              <NewProfileCtas
                activeViewIndex={activeView}
                profilePubkey={profilePubkey}
              />
            ) : (
              <ReusableTable
                tableType={'profileCollectionReleases'}
                items={profileCollectionReleases}
                hasOverflow={true}
                inCollection={inCollection}
                profileCollection={profileCollectionReleases}
                walletAddress={walletPubkey}
              />
            )}
          </>
        )
      case 2:
        return (
          <>
            {inDashboard && profileHubs?.length === 0 ? (
              <NewProfileCtas
                activeViewIndex={activeView}
                profilePubkey={profilePubkey}
              />
            ) : (
              <ReusableTable
                tableType={'profileHubs'}
                items={profileHubs}
                hasOverflow={true}
                inDashboard={inDashboard}
                walletConnected={wallet.connected}
              />
            )}
          </>
        )
      case 3:
        return (
          <>
            {inDashboard && profileSubscriptionsTo?.length === 0 ? (
              <NewProfileCtas
                activeViewIndex={activeView}
                profilePubkey={profilePubkey}
              />
            ) : (
              <ReusableTable
                tableType={'followers'}
                items={profileSubscriptionsTo}
                hasOverflow={true}
                walletConnected={wallet.connected}
              />
            )}
          </>
        )
      case 4:
        return (
          <>
            {inDashboard && profileSubscriptionsFrom?.length === 0 ? (
              <NewProfileCtas
                activeViewIndex={activeView}
                profilePubkey={profilePubkey}
              />
            ) : (
              <ReusableTable
                tableType={'following'}
                items={profileSubscriptionsFrom}
                hasOverflow={true}
                walletConnected={wallet.connected}
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
      <ProfileContainer>
        <ProfileHeaderWrapper>
          <ProfileHeaderContainer>
            <Box display="flex">
              {profilePubkey && (
                <>
                  <Box
                    display="flex"
                    sx={{
                      flexDirection: 'row',
                    }}
                  >
                    {profileImage && profileImage?.includes('https') ? (
                      <Image
                        height={100}
                        width={100}
                        src={getImageFromCDN(profileImage, 400)}
                        priority={true}
                        loader={loader}
                        alt={`${displayImageForAccount(
                          profilePubkey
                        )} profile image`}
                      />
                    ) : (
                      <img src={profileImage} height={100} width={100} />
                    )}
                    <Typography ml={1}>
                      {displayNameForAccount(profilePubkey)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mb: 1,
                      ml: 1,
                      flexDirection: { xs: 'column', md: 'row' },
                    }}
                    display="flex"
                    alignItems={'start'}
                    flexWrap={'wrap'}
                  >
                    {wallet.connected && (
                      <Subscribe accountAddress={profilePubkey} />
                    )}
                    <IdentityVerification
                      verifications={profileVerifications}
                      profilePubkey={profilePubkey}
                    />

                    {(inDashboard || isAdmin) && (
                      <Balance
                        profilePublishedReleases={profilePublishedReleases}
                        inDashboard={inDashboard}
                        profilePubkey={profilePubkey}
                        isAdmin={isAdmin && !inDashboard}
                      />
                    )}
                  </Box>
                </>
              )}
            </Box>
          </ProfileHeaderContainer>
        </ProfileHeaderWrapper>
        {hasData && (
          <Box>
            <TabHeader
              viewHandler={viewHandler}
              activeView={activeView}
              profileTabs={views}
            />
          </Box>
        )}
        {fetched.info && (
          <Box>
            <TabHeader
              viewHandler={viewHandler}
              activeView={activeView}
              profileTabs={tabCategories}
            />
          </Box>
        )}
        <>
          {!hasData && (
            <ProfileDotWrapper>
              <Box sx={{ margin: 'auto' }}>
                <Dots />
              </Box>
            </ProfileDotWrapper>
          )}
          <ProfileTableContainer ref={tableContainerRef}>
            {hasData && renderTables(activeView, inDashboard, inCollection)}
          </ProfileTableContainer>
        </>
      </ProfileContainer>
    </>
  )
}

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  minWidth: theme.maxWidth,
  maxWidth: theme.maxWidth,
  height: '86vh',
  overflowY: 'hidden',
  margin: '75px auto 0px',

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

const ProfileHeaderContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
    height: '100%',
  },
}))

const ProfileHeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100vw',
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
    paddingBottom: '10px',
  },
}))

const ProfileOverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  display: ['-webkit-box'],
  ['-webkit-line-clamp']: '5',
  ['-webkit-box-orient']: 'vertical',
  textOverflow: 'ellipsis',
  paddingTop: '5px',
  [theme.breakpoints.down('md')]: {
    ['-webkit-line-clamp']: '4',
  },
}))

const ProfileTableContainer = styled(Box)(({ theme }) => ({
  paddingBottom: '100px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none !important',
  },
  [theme.breakpoints.down('md')]: {
    paddingBottom: '200px',
    overflow: 'scroll',
    height: '100%',
    margin: '10px 0',
  },
}))

const ProfileDotWrapper = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  width: '100%',
  height: '100%',
  display: 'flex',
  textAlign: 'center',
  top: '50%',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '50%',
    top: '50%',
  },
}))

export default Profile
