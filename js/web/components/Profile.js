import { useEffect, useContext, useState, useMemo } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
import Subscribe from './Subscribe'

const Dots = dynamic(() => import('./Dots'))
const TabHeader = dynamic(() => import('./TabHeader'))
const ReusableTable = dynamic(() => import('./ReusableTable'))
const Feed = dynamic(() => import('./Feed'))

const Profile = ({ profilePubkey, inDashboard=false }) => {
  const wallet = useWallet()
  const router = useRouter()

  const {
    getUserCollectionAndPublished,
    collectRoyaltyForRelease,
  } = useContext(Release.Context)
  const { getHubsForUser } = useContext(Hub.Context)
  const {
    getSubscriptionsForUser,
    ninaClient
  } = useContext(Nina.Context)


  const [profilePublishedReleases, setProfilePublishedReleases] =
    useState(undefined)
  const [profileCollectionReleases, setProfileCollectionReleases] =
    useState(undefined)
  const [profileHubs, setProfileHubs] = useState(undefined)
  const [activeView, setActiveView] = useState()
  const [profileSubscriptions, setProfileSubscriptions] = useState()
  const [profileSubscriptionsTo, setProfileSubscriptionsTo] = useState()
  const [profileSubscriptionsFrom, setProfileSubscriptionsFrom] = useState()

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
    { name: 'followers', playlist: null, visible: false },
    { name: 'following', playlist: null, visible: false },
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
    console.log(fetched);
    getUserData(profilePubkey)
  }, [])

  useEffect(() => {
    if (router.query.view) {
      const viewIndex = views.findIndex((view) => view.name === router.query.view)
      setActiveView(viewIndex)
    }
  }, [router.query.view])
  
  useEffect(() => {
    if (profileSubscriptions){
      const to = []
      const from = []

      profileSubscriptions.forEach((sub) => {
        if (sub.to === profilePubkey) {
          to.push(sub)
        } else if (sub.from === profilePubkey) {
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
      updatedView[viewIndex].visible = true
    }
    if (profileCollectionReleases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'collection')
      updatedView[viewIndex].visible = true
    }
    if (profileHubs?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].visible = true
    }
    if (profileSubscriptionsTo?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'followers')
      updatedView[viewIndex].visible = true
    }
    if (profileSubscriptionsFrom?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'following')
      updatedView[viewIndex].visible = true
    }
    setViews(updatedView)
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs, profileSubscriptionsTo, profileSubscriptionsFrom])

  useEffect(() => {
    if (!router.query.view) {
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
    }
  }, [profilePublishedReleases, profileCollectionReleases, profileHubs])

  const getUserData = async () => {
    const hubs = await getHubsForUser(profilePubkey)

    const [collected, published] = await getUserCollectionAndPublished(
      profilePubkey,
      inDashboard
    )

    if (inDashboard) {
      published.forEach((release) => {
        const accountData = release.accountData.release
        release.recipient = accountData.revenueShareRecipients.find(
          (recipient) => recipient.recipientAuthority === profilePubkey
        )
        release.price = ninaClient.nativeToUiString(
          accountData.price,
          accountData.paymentMint
        )
        release.remaining = `${accountData.remainingSupply} / ${accountData.totalSupply}`
        release.collected = ninaClient.nativeToUiString(
          accountData.totalCollected,
          accountData.paymentMint
        )
        release.collectable = release.recipient.owed > 0
        release.collectableAmount = ninaClient.nativeToUiString(
          release.recipient.owed,
          accountData.paymentMint
        )
        release.paymentMint = accountData.paymentMint
      })
    }

    const subscriptions = await getSubscriptionsForUser(profilePubkey)

    setProfileCollectionReleases(collected)
    setProfilePublishedReleases(published)
    setProfileSubscriptions(subscriptions)

    fetched.user = true

    let viewIndex
    let updatedView = views.slice()

    viewIndex = updatedView.findIndex((view) => view.name === 'releases')
    updatedView[viewIndex].playlist = published
    fetched.releases = true

    viewIndex = updatedView.findIndex((view) => view.name === 'collection')
    updatedView[viewIndex].playlist = collected
    fetched.collection = true
    setProfileHubs(hubs)
    fetched.hubs = true
    setFetched({
      ...fetched,
    })
  }

  const viewHandler = (event) => {
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
  }

  return (
    <>
       <ProfileContainer>
        {!inDashboard && (
          <ProfileHeaderWrapper>
            <ProfileHeaderContainer>
              {fetched.user && profilePubkey && (
                <Box sx={{mb:1}} display='flex'>
                  <Typography>{truncateAddress(profilePubkey)}</Typography>
                  
                  {wallet.connected && (
                    <Subscribe accountAddress={profilePubkey} />
                  )}
                </Box>
              )}
              {fetched.user && artistNames?.length > 0 && (
                <ProfileOverflowContainer>
                  {`Publishes as ${artistNames?.map((name) => name).join(', ')}`}
                </ProfileOverflowContainer>
              )}
            </ProfileHeaderContainer>
          </ProfileHeaderWrapper>
        )}
        {fetched.user &&
          fetched.collection &&
          fetched.releases &&
          fetched.hubs && (
            <Box sx={{ py: 1 }}>
              <TabHeader
                viewHandler={viewHandler}
                activeView={activeView}
                profileTabs={views}
                followersCount={profileSubscriptionsTo?.length}
                followingCount={profileSubscriptionsFrom?.length}
              />
            </Box>
          )}

        <>
          {!activeView === undefined && (
            <ProfileDotWrapper>
              <Box sx={{ margin: 'auto' }}>
                <Dots />
              </Box>
            </ProfileDotWrapper>
          )}

          {activeView === 0 && (
            <>
              {fetched.releases && profilePublishedReleases.length === 0 && (
                <Box>No releases belong to this address</Box>
              )}
              {fetched.releases && profilePublishedReleases.length > 0 && (
                <ReusableTable
                  tableType={'profilePublishedReleases'}
                  items={profilePublishedReleases}
                  inDashboard={inDashboard}
                  collectRoyaltyForRelease={collectRoyaltyForRelease}
                  refreshProfile={getUserData}
                />
              )}
            </>
          )}

          {activeView === 1 && (
            <>
              {fetched.collection && profileCollectionReleases.length === 0 && (
                <Box>No collection found at this address</Box>
              )}
              {fetched.collection && profileCollectionReleases.length > 0 && (
                <ReusableTable
                  tableType={'profileCollectionReleases'}
                  items={profileCollectionReleases}
                />
              )}
            </>
          )}
          {activeView === 2 && (
            <>
              {fetched.hubs && profileHubs.length === 0 && (
                <Box>No Hubs belong to this address</Box>
              )}
              {fetched.hubs && profileHubs.length > 0 && (
                <ReusableTable
                  tableType={'profileHubs'}
                  items={profileHubs}
                />
              )}
            </>
          )}
          {activeView === 3 && (
            <>
              {fetched.hubs && profileHubs.length > 0 && (
                <ReusableTable
                  tableType={'followers'}
                  items={profileSubscriptionsTo}
                />
              )}
            </>
          )}
          {activeView === 4 && (
            <>
              {fetched.hubs && profileHubs.length > 0 && (
                <ReusableTable
                  tableType={'following'}
                  items={profileSubscriptionsFrom}
                />
              )}
            </>
          )}
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

const ProfileHeaderContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
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
  minHeight: '100px',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
    height: '100px',
  },
}))

const ProfileOverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  display: ['-webkit-box'],
  ['-webkit-line-clamp']: '4',
  ['-webkit-box-orient']: 'vertical',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    ['-webkit-line-clamp']: '4',
  },
}))

const ProfileDotWrapper = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  width: '100%',
  height: '100%',
  display: 'flex',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '50%',
    top: '50%',
  },
}))

export default Profile
