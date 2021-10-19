import React, { useEffect, useState, useContext } from 'react'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { Box } from '@material-ui/core'
import ReleaseListTable from './ReleaseListTable'
import UserView from './UserView'

const { NameContext, ReleaseContext } = ninaCommon.contexts

const ReleaseList = () => {
  const { searchResults, resetSearchResults, getReleasesRecent, releasesRecentState, filterReleasesRecent } = useContext(ReleaseContext)
  const classes = useStyles()
  const wallet = useWallet()
  const { getReleasesForTwitterHandle } = useContext(NameContext)
  const [search, setSearch] = useState(searchResults.handle)
  const [releasesRecent, setReleasesRecent] = useState({})

  useEffect(() => {
    getReleasesRecent()
  }, [])

  useEffect(() => {
    setSearch(searchResults.handle)
  }, [searchResults])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())
  }, [releasesRecentState])

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
            <ReleaseListTable
              releases={releasesRecent.published || []}
              key="releases"
            />
        </>
      )}
      {wallet?.connected && !searchResults.searched && <UserView />}
    </Box>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    height: '80%',
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    'overflow-y': 'scroll',
    top: 40,
  },
}))

export default ReleaseList
