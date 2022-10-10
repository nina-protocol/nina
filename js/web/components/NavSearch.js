import { useEffect, useState, useRef } from 'react'
import NinaSdk from '@nina-protocol/js-sdk'
import axios from 'axios'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const SearchDropdown = dynamic(() => import('./SearchDropdown'))

const NavSearch = () => {
const router = useRouter()
  const [query, setQuery] = useState('')
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
  const dropdownRef = useRef()
  const searchInputRef = useRef()

  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
  }, [])

  //   useEffect(() => {

  //     if (searchQuery) {
  //       const query = searchQuery.q
  //       setQuery(query)
  //     }
  //     if (searchResults) {
  //       setResponse(searchResults)
  //       setFetchedResponse(true)
  //     }
  //   }, [searchResults, searchQuery])

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
      router.push(`/search?q=${query}`)
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
      router.push(`/search/?q=${search}`)
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
    <Box>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <SearchInputWrapper>
            <SearchInput
            onChange={(e) => changeHandler(e)}
            value={query}
            autoComplete="off"
            onFocus={(e) => handleSearchClick(e)}
            ref={searchInputRef}
            placeholder="Search for artists, releases, hubs"
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
    </Box>
  )
}

const SearchInputWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100vw',
}))
const Form = styled('form')(({ theme }) => ({}))
const SearchInput = styled('input')(({theme}) => ({
    border: 0,
    borderBottom: '1px solid #000000',
    width: '15vw',
    marginRight: '20px',
    outline: 'none !important'
}))
const DropdownContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  zIndex: '100',
  position: 'absolute',
  overflow: 'hidden',
  textAlign: 'left',
  backgroundColor: 'rgba(255,255,255,0.9)',
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
const SearchInputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
}))

export default NavSearch
