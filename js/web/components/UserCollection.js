import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import nina from "@nina-protocol/nina-sdk";
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography, Box } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import ShareIcon from '@mui/icons-material/Share'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import ReleaseListTable from './ReleaseListTable'
import ReleaseTileList from './ReleaseTileList'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { AudioPlayerContext, ReleaseContext, NinaContext } = nina.contexts

const ReleaseList = ({ userId }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { resetQueueWithPlaylist } = useContext(AudioPlayerContext)
  const {
    getReleasesInCollection,
    filterReleasesUserCollection,
    releaseState,
    getUserCollection,
    filterReleasesList,
  } = useContext(ReleaseContext)
  const [listView, setListView] = useState(false)

  const wallet = useWallet()
  const { collection, createCollection } = useContext(NinaContext)
  const [userCollectionReleases, setUserCollectionReleases] =
    useState(undefined)
  const [userCollectionList, setUserCollectionList] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      getOtherUserCollectionHandler(userId)
    } else {
      createCollection()
    }
  }, [])

  useEffect(() => {
    if (wallet?.connected && !userId) {
      getReleasesInCollection()
    } else if (!wallet.connected && !userId) {
      setUserCollectionList(undefined)
      setUserCollectionReleases(undefined)
    }
    console.log("collection ::> ", collection)
  }, [collection])

  useEffect(() => {
    if (userId && userCollectionList) {
      setUserCollectionReleases(filterReleasesList(userCollectionList))
    } else if (!userId && wallet?.connected) {
      console.log("collection 2 ::> ", collection)
      const hasCollection = Object.keys(collection).every((releasePubkey) => {
        return releaseState.metadata[releasePubkey]
      })
      console.log("hasCollection ::> ", hasCollection)
      if (hasCollection) {
        setUserCollectionReleases(filterReleasesUserCollection())
      }
    }
  }, [releaseState, userCollectionList])

  useEffect(() => {
    setLoading(false)
  }, [userCollectionReleases])

  const getOtherUserCollectionHandler = async (userId) => {
    const collection = await getUserCollection(userId)
    setUserCollectionList(collection)
  }

  const handleViewChange = () => {
    setListView(!listView)
  }

  const nameString = userId
    ? `${userId.slice(0, 4) + '..' + userId.slice(-4)}'s`
    : 'Your'

  return (
    <>
      <Head>
        <title>{`Nina: ${nameString} Collection(${
          userCollectionReleases?.length || 0
        })`}</title>
        <meta name="description" content={'Your collection on Nina.'} />
      </Head>
      <ScrollablePageWrapper>
        {userCollectionReleases?.length > 0 && (
          <Wrapper>
            <CollectionHeader listView={listView}>
              <Typography variant="body1" fontWeight="700">
                {nameString} Collection
                <Button
                  onClick={() =>
                    resetQueueWithPlaylist(
                      userCollectionReleases.map(
                        (release) => release.releasePubkey
                      )
                    ).then(() =>
                      enqueueSnackbar(`Now Playing: ${nameString} Collection`, {
                        variant: 'info',
                      })
                    )
                  }
                >
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
                </Button>
                <Button
                  onClick={() =>
                    navigator.clipboard
                      .writeText(
                        `https://ninaprotocol.com/collection/${
                          userId || wallet.publicKey.toBase58()
                        }`
                      )
                      .then(() =>
                        enqueueSnackbar(
                          'Link to collection copied to clipboard',
                          { variant: 'info' }
                        )
                      )
                  }
                >
                  <ShareIcon sx={{ color: 'black' }} />
                </Button>
              </Typography>
              <Typography
                onClick={handleViewChange}
                sx={{ cursor: 'pointer', margin: 'auto 0' }}
              >
                {listView ? 'Cover View' : 'List View'}
              </Typography>
            </CollectionHeader>

            {listView && (
              <ReleaseListTable
                releases={userCollectionReleases}
                tableType="userCollection"
                key="releases"
              />
            )}
            {!listView && <ReleaseTileList releases={userCollectionReleases} />}
          </Wrapper>
        )}
        {!loading &&
          userCollectionReleases &&
          userCollectionReleases.length === 0 && (
            <Typography>Your collection is empty!</Typography>
          )}
        {!loading &&
          userId &&
          !userCollectionReleases &&
          userCollectionList && (
            <Typography>
              Invalid Address, check to make sure you have the right Account
            </Typography>
          )}
        {!loading && !userId && !wallet?.publicKey && (
          <Typography>Connect your wallet to view you collection</Typography>
        )}
      </ScrollablePageWrapper>
    </>
  )
}

const CollectionHeader = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '15px',
  '& .MuiButton-root:last-of-type': {
    [theme.breakpoints.down('md')]: {
      paddingRight: '4px',
    },
  },
}))

const Wrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
  },
}))

export default ReleaseList
