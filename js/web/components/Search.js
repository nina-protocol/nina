import NinaSdk from '@nina-protocol/js-sdk'
import { useEffect, useState, useRef } from 'react'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import { useCallback } from 'react'
import Dots from './Dots'
import Link from 'next/link'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const SearchDropdown = dynamic(() => import('./SearchDropdown'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const Search = () => {
  const {query} = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [response, setResponse] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])
  const [options, setOptions] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [fetchedResponse, setFetchedResponse] = useState(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  const [autoCompleteResults, setAutocompleteResults] = useState([
    { name: 'artists', visible: false },
    { name: 'releases', visible: false },
    { name: 'hubs', visible: false },
  ])
  const ref = useRef()

  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
  }, [])

  useEffect(() => {
    const handleDropdown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleDropdown)

    return () => {
      document.removeEventListener('click', handleDropdown)
    }
  }, [showDropdown, ref])


  
  useEffect(() => {
    if (searchQuery) {
      suggestions?.artists.length > 0
        ? (autoCompleteResults[0].visible = true)
        : (autoCompleteResults[0].visible = false)
      suggestions?.releases.length > 0
        ? (autoCompleteResults[1].visible = true)
        : (autoCompleteResults[1].visible = false)
      suggestions?.hubs.length > 0
        ? (autoCompleteResults[2].visible = true)
        : (autoCompleteResults[2].visible = false)
      setAutocompleteResults([...autoCompleteResults])
    }
  }, [suggestions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFetchedResponse(false)

    if (e.target.value !== null || e.target.value !== '') {
      setSearchQuery(e.target.value)
      await NinaSdk.Search.withsearchQuery(searchQuery).then(setResponse)
      setFetchedResponse(true)
    }

    if (searchQuery === '') {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    setSearchQuery('')
    setSuggestions([])
    setShowDropdown(false)
  }

  const autoCompleteUrl = 'https://dev.api.ninaprotocol.com/v1/suggestions'

  const handleAutoComplete = async (searchQuery) => {
    setLoading(true)
    const response = await axios.post(autoCompleteUrl, { searchQuery })
    if (searchQuery) {
      setSuggestions(response.data)
    }
    if (suggestions) {
      setLoading(false)
    }
  }

  const changeHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSearchQuery(e.target.value)
    setShowDropdown(true)
    if (searchQuery) {
      handleAutoComplete(searchQuery)
    }
  }
  console.log('response', response)
  return (
    <Box sx={{ height: '60vh', width: '960px' }}>
      <Box sx={{ position: 'relative' }}>
        <Form onSubmit={(e) => handleSubmit(e)}>
          <SearchInputWrapper>
            <TextField
              className="search-input"
              fullWidth
              id="outlined-basic"
              label="Search"
              variant="standard"
              onChange={(e) => changeHandler(e)}
              value={searchQuery}
              autoComplete="off"
              onClick={() => setShowDropdown(true)}
            />
          </SearchInputWrapper>
        </Form>

        {showDropdown && (
          <DropdownContainer ref={ref}>
            {autoCompleteResults.map((result, index) => {
              if (result.visible) {
                return (
                  <ResponsiveSearchResultContainer key={index}>
                    <SearchDropdown
                      category={result.name}
                      searchData={suggestions}
                      hasResults={result.visible}
                    />
                  </ResponsiveSearchResultContainer>
                )
              }
            })}

            {searchQuery?.length > 0 &&
              suggestions?.artists?.length === 0 &&
              suggestions?.releases?.length === 0 &&
              suggestions?.hubs?.length === 0 && (
                <Typography>No results found</Typography>
              )}
          </DropdownContainer>
        )}
      </Box>
      <SearchResultsWrapper>
        <ResponsiveSearchResultContainer>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}

          {fetchedResponse && response.artists.length > 0 && (
            <>
              <ReusableTable
                tableType="searchResultArtists"
                releases={response?.artists}
              />
            </>
          )}

          {fetchedResponse && response.releases.length > 0 && (
            <>
              <ReusableTable
                tableType="searchResultReleases"
                releases={response?.releases}
              />
            </>
          )}

          {fetchedResponse && response.hubs.length > 0 && (
            <>
              <ReusableTable
                tableType={'searchResultHubs'}
                releases={response?.hubs}
              />
            </>
          )}
        </ResponsiveSearchResultContainer>
      </SearchResultsWrapper>
    </Box>
  )
}

const SearchInputWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '960px',
}))
const Form = styled('form')(({ theme }) => ({}))
const SearchResultsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
}))
const ResponsiveSearchResultContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  width: '960px',
  overflow: 'auto',
  webkitOverflowScrolling: 'touch',
  padding: '10px 0',
}))

const ResponsiveDotContainer = styled(Box)(({ theme }) => ({
  fontSize: '80px',
  display: 'flex',
  height: '100%',
  [theme.breakpoints.down('md')]: {
    fontSize: '30px',
    left: '47%',
    top: '53%',
  },
}))

const DropdownContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  zIndex: '100',
  position: 'absolute',
  overflow: 'hidden',
  textAlign: 'left',
  backgroundColor: 'rgba(255,255,255,0.9)',
}))

export default Search
