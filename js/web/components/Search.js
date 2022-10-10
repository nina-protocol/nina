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

const Search = (props) => {
  const { searchResults, searchQuery } = props
  const [query, setQuery] = useState(searchQuery?.q)
  const [response, setResponse] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchedResponse, setFetchedResponse] = useState(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)
  const [autoCompleteResults, setAutocompleteResults] = useState([
    { name: 'artists', visible: false },
    { name: 'releases', visible: false },
    { name: 'hubs', visible: false },
  ])
  console.log('props', props)
  const dropdownRef = useRef()
  const searchInputRef = useRef()
  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
  }, [])

  useEffect(() => {
    console.log('searchQuery', searchQuery)
    console.log('searchResults', searchResults)

    if (searchQuery) {
      const query = searchQuery.q
      setQuery(query)
    }
    if (searchResults) {
      setResponse(searchResults)
      setFetchedResponse(true)
    }
  }, [searchResults, searchQuery])

  useEffect(() => {
    const handleDropdown = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('click', handleDropdown)

    return () => {
      document.removeEventListener('click', handleDropdown)
    }
  }, [showDropdown, dropdownRef])

  useEffect(() => {
    if (query && setShowDropdown) {
      suggestions?.artists?.length > 0
        ? (autoCompleteResults[0].visible = true)
        : (autoCompleteResults[0].visible = false)
      suggestions?.releases?.length > 0
        ? (autoCompleteResults[1].visible = true)
        : (autoCompleteResults[1].visible = false)
      suggestions?.hubs?.length > 0
        ? (autoCompleteResults[2].visible = true)
        : (autoCompleteResults[2].visible = false)
      setAutocompleteResults([...autoCompleteResults])
    }
  }, [suggestions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFetchedResponse(false)

    if (
      e.target.value !== null ||
      e.target.value !== '' ||
      e.target.value !== undefined
    ) {
      await NinaSdk.Search.withQuery(query).then(setResponse)
      setFetchedResponse(true)
      window.history.pushState(null, query, `?q=${query}`)
    }
    if (query === '') {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setShowDropdown(false)
  }

  const autoCompleteUrl = 'https://dev.api.ninaprotocol.com/v1/suggestions'

  const handleAutoComplete = async (query) => {
    setLoading(true)
    const response = await axios.post(autoCompleteUrl, { query })
    if (query.length > 0) {
      setSuggestions(response.data)
    }
    if (suggestions) {
      setLoading(false)
    }
  }

  const changeHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const search = e.target.value
    console.log('searrch', search)
    setQuery(search)
    setShowDropdown(true)
    if (query) {
      handleAutoComplete(query)
    }
  }

  const handleSuggestionsClick = async (search) => {
    setFetchedResponse(false)
    await NinaSdk.Search.withQuery(search).then(setResponse)
    setFetchedResponse(true)
    if (fetchedResponse) {
      setShowDropdown(false)
      window.history.pushState(null, search, `?q=${search}`)
    }
  }

  const suggestionsHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const clickedSuggestion = e.target.innerText
    if (clickedSuggestion) {
      setQuery(clickedSuggestion)
      setShowDropdown(false)
    }

    handleSuggestionsClick(clickedSuggestion)
  }

  const handleSearchClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setInputFocus(true)
    if (inputFocus) {
      setShowDropdown(true)
    }
  }
  return (
    <SearchPageContainer >
      <SearchInputContainer>
        <Form onSubmit={(e) => handleSubmit(e)}>
          <SearchInputWrapper>
            <TextField
              className="search-input"
              fullWidth
              id="outlined-basic"
              label="Search"
              variant="standard"
              onChange={(e) => changeHandler(e)}
              value={query}
              autoComplete="off"
              onFocus={(e) => handleSearchClick(e)}
              ref={searchInputRef}
            />
          </SearchInputWrapper>
        </Form>

        {showDropdown && (
          <DropdownContainer ref={dropdownRef}>
            {autoCompleteResults.map((result, index) => {
              if (result.visible) {
                return (
                  <ResponsiveSearchResultContainer key={index}>
                    <SearchDropdown
                      category={result.name}
                      searchData={suggestions}
                      hasResults={result.visible}
                      clickHandler={(e) => suggestionsHandler(e)}
                    />
                  </ResponsiveSearchResultContainer>
                )
              }
            })}

            {query?.length > 0 &&
              suggestions?.artists?.length === 0 &&
              suggestions?.releases?.length === 0 &&
              suggestions?.hubs?.length === 0 && (
                <Typography>No results found</Typography>
              )}
          </DropdownContainer>
        )}
      </SearchInputContainer>
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
          {query?.length > 0 &&
            fetchedResponse &&
            response?.artists?.length === 0 &&
            response?.releases?.length === 0 &&
            response?.hubs?.length === 0 && (
              <Typography>No results found</Typography>
            )}
        </ResponsiveSearchResultContainer>
      </SearchResultsWrapper>
    </SearchPageContainer>
  )
}

const SearchPageContainer = styled(Box)(({ theme }) => ({
  height: '60vh',
  maxWidth: theme.maxWidth,
  [theme.breakpoints.down('md')]: {
    height: '80vh'
  }
}))

const SearchInputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
    
  },
}))
const SearchInputWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100vw',
}))
const Form = styled('form')(({ theme }) => ({}))
const SearchResultsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',

}))

const ResponsiveSearchResultContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  maxWidth: theme.maxWidth,
  overflowY: 'auto',
  webkitOverflowScrolling: 'touch',
  padding: '10px 0',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '100px',
   
  },
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
