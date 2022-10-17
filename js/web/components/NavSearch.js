import { useEffect, useState, useRef, useContext } from 'react'
import NinaSdk from '@nina-protocol/js-sdk'
import axios from 'axios'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
const SearchDropdown = dynamic(() => import('./SearchDropdown'))

const NavSearch = () => {
  const router = useRouter()
  const [query, setQuery] = useState()
  const [, setResponse] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
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
      suggestions?.artists?.length
        ? (autoCompleteResults[0].visible = true)
        : (autoCompleteResults[0].visible = false)
      suggestions?.releases?.length
        ? (autoCompleteResults[1].visible = true)
        : (autoCompleteResults[1].visible = false)
      suggestions?.hubs?.length
        ? (autoCompleteResults[2].visible = true)
        : (autoCompleteResults[2].visible = false)
      setAutocompleteResults([...autoCompleteResults])
    }
  }, [suggestions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (
      e.target.value !== null ||
      e.target.value !== '' ||
      e.target.value !== undefined
    ) {
      await NinaSdk.Search.withQuery(query).then(setResponse)
      router.push(`/search/?q=${query}`)
    }
    if (query === '') {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setShowDropdown(false)
    setShowSearchInput(false)
  }

  const autoCompleteHandler = async (query) => {
    const response = await axios.post(
      `${NinaSdk.client.endpoint}/suggestions`,
      { query }
    )
    if (query.length > 0) {
      setSuggestions(response.data)
    }
  }

  const changeHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const search = e.target.value

    setQuery(search)
    if (query !== '') {
      setShowDropdown(true)
    }

    if (query) {
      autoCompleteHandler(query)
    }
  }

  const suggestionsClickHandler = (search, searchFilter) => {
    setQuery('')
    router.push(
      `/search/?q=${search}${searchFilter ? `&type=${searchFilter}` : ''}`
    )
  }

  const suggestionsHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const clickedSuggestion = e.target.innerText
    const searchFilter = e.target.id
    if (clickedSuggestion) {
      setQuery(clickedSuggestion)
      setShowDropdown(false)
      setShowSearchInput(false)
    }

    suggestionsClickHandler(clickedSuggestion, searchFilter)
  }

  const handleInputFocus = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setInputFocus(true)
    if (inputFocus && query) {
      setShowDropdown(true)
    }
  }
  const keyHandler = (e) => {
    const clickedSuggestion = e.target.innerText
    const searchFilter = e.target.id
    if (e.key === 'Enter') {
      setQuery(clickedSuggestion)
      suggestionsClickHandler(clickedSuggestion, searchFilter)
      setShowDropdown(false)
      setShowSearchInput(false)
    }
  }

  return (
    <>
      <DesktopNavSearch
        handleSubmit={handleSubmit}
        changeHandler={changeHandler}
        handleInputFocus={handleInputFocus}
        suggestionsHandler={suggestionsHandler}
        query={query}
        suggestions={suggestions}
        dropdownRef={dropdownRef}
        searchInputRef={searchInputRef}
        showDropdown={showDropdown}
        autoCompleteResults={autoCompleteResults}
        keyHandler={(e) => keyHandler(e)}
      />
      <MobileNavSearch
        handleSubmit={handleSubmit}
        changeHandler={changeHandler}
        handleInputFocus={handleInputFocus}
        suggestionsHandler={suggestionsHandler}
        query={query}
        suggestions={suggestions}
        dropdownRef={dropdownRef}
        searchInputRef={searchInputRef}
        showDropdown={showDropdown}
        autoCompleteResults={autoCompleteResults}
        keyHandler={(e) => keyHandler(e)}
        setShowDropdown={setShowDropdown}
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
      />
    </>
  )
}

const DesktopNavSearch = ({
  handleSubmit,
  changeHandler,
  handleInputFocus,
  suggestionsHandler,
  query,
  suggestions,
  dropdownRef,
  searchInputRef,
  showDropdown,
  autoCompleteResults,
  keyHandler,
  releasesRecent,
}) => {
  return (
    <DesktopNavSearchContainer>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <SearchInputWrapper>
          <SearchInput
            onChange={(e) => changeHandler(e)}
            value={query}
            autoComplete="off"
            onFocus={(e) => handleInputFocus(e)}
            ref={searchInputRef}
            placeholder="Search for artists, releases, hubs"
            type="search"
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
                    onKeyDown={(e) => keyHandler(e)}
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
    </DesktopNavSearchContainer>
  )
}

const MobileNavSearch = ({
  showSearchInput,
  handleInputFocus,
  dropdownRef,
  handleSubmit,
  changeHandler,
  query,
  searchInputRef,
  suggestions,
  setShowSearchInput,
  showDropdown,
  suggestionsHandler,
  
  autoCompleteResults,
  keyHandler,
}) => {
  return (
    <MobileNavSearchContainer>
      <Box>
        {showSearchInput ? (
          <CloseIcon onClick={() => setShowSearchInput(false)} />
        ) : (
          <SearchIcon onClick={() => setShowSearchInput(true)} />
        )}
      </Box>
      {showSearchInput && (
        <MobileSearchContainer ref={dropdownRef}>
          <MobileSearchInputWrapper>
            <Form onSubmit={(e) => handleSubmit(e)}>
              <SearchInput
                onChange={(e) => changeHandler(e)}
                value={query}
                autoComplete="off"
                onFocus={(e) => handleInputFocus(e)}
                ref={searchInputRef}
                placeholder="Search for artists, releases, hubs"
                type="search"
              />
            </Form>
          </MobileSearchInputWrapper>
          {showDropdown && (
            <MobileDropdownContainer>
              {autoCompleteResults.map((result, index) => {
                if (result.visible) {
                  return (
                    <ResponsiveSearchResultContainer key={index}>
                      <SearchDropdown
                        category={result.name}
                        searchData={suggestions}
                        hasResults={result.visible}
                        clickHandler={(e) => suggestionsHandler(e)}
                        onKeyDown={(e) => keyHandler(e)}
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
            </MobileDropdownContainer>
          )}
        </MobileSearchContainer>
      )}
    </MobileNavSearchContainer>
  )
}

const DesktopNavSearchContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}))

const SearchInputWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100vw',
}))
const Form = styled('form')(({ theme }) => ({}))
const SearchInput = styled('input')(({ theme }) => ({
  border: 0,
  borderBottom: '1px solid #000000',
  width: '15vw',
  marginRight: '20px',
  outline: 'none !important',
  backgroundColor: '#fff',
  [theme.breakpoints.down('md')]: {
    margin: '15px 0',
    padding: '2px 0',
    width: '90vw',
  },
}))
const DropdownContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  width: '15vw',
  zIndex: '100',
  position: 'absolute',
  overflow: 'hidden',
  textAlign: 'left',
  marginRight: '20px',
  backgroundColor: '#fff',
  padding: '0 2px',
}))

const ResponsiveSearchResultContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  maxWidth: theme.maxWidth,
  overflowY: 'auto',
  webkitOverflowScrolling: 'touch',
  padding: '10px 0',
}))

const MobileNavSearchContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '65px',
  height: '100%',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))
const MobileSearchInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  margin: '0px 10px',
}))
const MobileSearchContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '95vw',
  zIndex: '100',
  position: 'absolute',
  overflow: 'hidden',
  textAlign: 'left',
  left: '-50px',
}))
const MobileDropdownContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '95vw',
  zIndex: '100',
  display: 'block',
  position: 'absolute',
  background: '#fff',
  textAlign: 'left',
  padding: '0 10px',
}))
export default NavSearch
