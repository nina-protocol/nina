import React, { useEffect, useState, useContext } from 'react'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { Box, Typography } from '@material-ui/core'
import ReleaseListTable from './ReleaseListTable'

const { NameContext, ReleaseContext, NinaContext } = ninaCommon.contexts

const ReleaseList = () => {
  const {
    searchResults,
    resetSearchResults,
    filterReleasesUserCollection,
    releaseState,
  } = useContext(ReleaseContext)
  const classes = useStyles()
  const wallet = useWallet()
  const { collection } = useContext(NinaContext)
  const { getReleasesForTwitterHandle } = useContext(NameContext)
  const [search, setSearch] = useState(searchResults.handle)
  const [userCollectionReleases, setUserCollectionReleases] = useState()

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleases(filterReleasesUserCollection())
    }
  }, [releaseState, collection])

  useEffect(() => {
    setSearch(searchResults.handle)
  }, [searchResults])

  const handleSubmit = (e) => {
    e.preventDefault()
    getReleasesForTwitterHandle(search)
  }

  const checkIfEmpty = (e) => {
    e.preventDefault()
    if (e.target.value === '') {
      resetSearchResults()
    }
  }

  return (
    <Box className={classes.root}>
      <div>
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
      </div>
      {searchResults.searched && searchResults.releases.length > 0 && (
        <ReleaseListTable releases={searchResults.releases} key="search" />
      )}
      {searchResults.searched && searchResults.releases.length === 0 && (
        <h1>
          No results found for{' '}
          <a
            href={`https://www.twitter.com/${search}`}
            target="_blank"
            rel="noreferrer"
          >
            @{searchResults.handle}
          </a>
        </h1>
      )}
      {!wallet?.connected && !searchResults.searched && (
        <>
          <h1>Welcome to Nina</h1>
          <h2>
            Connect your wallet to listen to your collection or publish a new
            release
          </h2>
          <h2>
            Or search for your favorite artists Twitter handle to see if they on
            Nina
          </h2>
        </>
      )}
      {wallet?.connected &&
        !searchResults.searched &&
        userCollectionReleases?.length > 0 && (
          <ReleaseListTable
            releases={userCollectionReleases}
            tableType="userCollection"
            key="releases"
          />
        )}
      {wallet?.connected &&
        !searchResults.searched &&
        userCollectionReleases?.length === 0 && (
          <Typography>
            <h1>Your collection is empty!</h1>
          </Typography>
        )}
    </Box>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 40,
  },
}))

export default ReleaseList
