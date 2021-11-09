import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
// import TextField from '@mui/material/TextField'
import { Box, Typography } from '@mui/material'
import ReleaseListTable from './ReleaseListTable'

const { ReleaseContext, NinaContext } = ninaCommon.contexts

const ReleaseList = () => {
  const {
    searchResults,
    // resetSearchResults,
    getReleasesRecent,
    releasesRecentState,
    filterReleasesRecent,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    collectRoyaltyForRelease,
    releaseState,
  } = useContext(ReleaseContext)

  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  // const { getReleasesForTwitterHandle } = useContext(NameContext)
  const [search, setSearch] = useState(searchResults.handle)
  const [releasesRecent, setReleasesRecent] = useState({})

  useEffect(() => {
    getReleasesRecent()
  }, [])
  const [userPublishedReleases, setUserPublishedReleases] = useState()

  useEffect(() => {
    if (wallet?.connected && !userPublishedReleases) {
      getReleasesPublishedByUser()
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser())
    }
  }, [releaseState, collection])

  useEffect(() => {
    setSearch(searchResults.handle)
  }, [searchResults])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())
  }, [releasesRecentState])

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   getReleasesForTwitterHandle(search)
  // }

  // const checkIfEmpty = (e) => {
  //   e.preventDefault()
  //   if (e.target.value === '') {
  //     resetSearchResults()
  //   }
  // }

  return (
    <StyledBox>
      {/* <div>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Search"
            margin="normal"
            variant="outlined"
            value={search}
            fullWidth={true}
            onInput={(e) => setSearch(e.target.value)}
            onChange={(e) => checkIfEmpty(e)}
            InputProps={{ type: 'search' }}
          />
        </form>
      </div> */}
      {searchResults.searched && searchResults.releases.length > 0 && (
        <ReleaseListTable releases={searchResults.releases} key="search" />
      )}
      {searchResults.searched && searchResults.releases.length === 0 && (
        <p>
          No results found for{' '}
          <a
            href={`https://www.twitter.com/${search}`}
            target="_blank"
            rel="noreferrer"
          >
            @{searchResults.handle}
          </a>
        </p>
      )}
      {!wallet?.connected && !searchResults.searched && (
        <>
          <p>Welcome to Nina</p>
          <ReleaseListTable
            releases={releasesRecent.published || []}
            key="releases"
          />
        </>
      )}
      {wallet?.connected &&
        !searchResults.searched &&
        userPublishedReleases?.length > 0 && (
          <ReleaseListTable
            releases={userPublishedReleases}
            tableType="userPublished"
            collectRoyaltyForRelease={collectRoyaltyForRelease}
            key="releases"
          />
        )}
      {wallet?.connected &&
        !searchResults.searched &&
        userPublishedReleases?.length === 0 && (
          <>
            <Typography>{`You haven't published any music yet.`}</Typography>
          </>
        )}
    </StyledBox>
  )
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
}))

export default ReleaseList
