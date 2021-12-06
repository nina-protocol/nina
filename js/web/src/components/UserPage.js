import React, { useEffect, useState, useContext } from 'react'
import { Helmet } from 'react-helmet'
const { PublicKey } = require('@solana/web3.js')
import ninaCommon from 'nina-common'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography, Box } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'
import ReleaseTileList from './ReleaseTileList'
import ScrollablePageWrapper from './ScrollablePageWrapper'

const { ReleaseContext, NinaContext } = ninaCommon.contexts

const UserPage = ({ match }) => {
  const authorityPubkey = new PublicKey(match.params.pubKey)
  const {
    filterReleasesUserCollection,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    releaseState,
  } = useContext(ReleaseContext)
  const [listView, setListView] = useState(false)

  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  const [userCollectionReleases, setUserCollectionReleases] = useState()
  const [userPublishedReleases, setUserPublishedReleases] = useState(null)
  const [userHandles, setUserHandles] = useState(null)

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleases(filterReleasesUserCollection())
    }
  }, [releaseState, collection])

  useEffect(() => {
    if (authorityPubkey) {
      getReleasesPublishedByUser(authorityPubkey)
    }
  }, [])

  useEffect(() => {
    setUserPublishedReleases(
      filterReleasesPublishedByUser(authorityPubkey.toBase58())
    )
  }, [releaseState])

  useEffect(() => {
    if (userPublishedReleases) {
      const handles = userPublishedReleases.map((release) => {
        return release.metadata.properties.artist
      })
      const filteredHandles = [...new Set(handles)]
      setUserHandles(filteredHandles.join(' / '))
    }
  }, [userPublishedReleases])

  const handleViewChange = () => {
    setListView(!listView)
  }

  return (
    <>
      <Helmet>
        <title>{`Nina: Your Collection(${
          userCollectionReleases?.length || 0
        })`}</title>
        <meta name="description" content={'Your collection on Nina.'} />
      </Helmet>
      <ScrollablePageWrapper>
        <Wrapper>
          {userPublishedReleases?.length > 0 && (
            <>
              <CollectionHeader listView={listView}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: '700 !important' }}
                >
                  Releases by {userHandles}
                </Typography>
                <Typography
                  onClick={handleViewChange}
                  sx={{ cursor: 'pointer' }}
                >
                  {listView ? 'Cover View' : 'List View'}
                </Typography>
              </CollectionHeader>

              {listView && (
                <ReleaseListTable
                  releases={userPublishedReleases}
                  tableType="userCollection"
                  key="releases"
                />
              )}
              {!listView && (
                <ReleaseTileList releases={userPublishedReleases} />
              )}
            </>
          )}
        </Wrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const CollectionHeader = styled(Box)(({ listView }) => ({
  maxWidth: listView ? '800px' : '960px',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '15px',
}))

const Wrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
  },
}))

export default UserPage
