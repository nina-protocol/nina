import { useEffect, useState, useRef, useContext } from 'react'
import NinaSdk from '@nina-protocol/js-sdk'
import axios from 'axios'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import { over } from 'lodash'
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
    initSdkIfNeeded()
  }, [])

  useEffect(() => {
    const handleDropdown = (e) => {
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(e.target) &&
        !searchInputRef?.current?.contains(e.target)
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

    if (query?.length > 0) {
      await NinaSdk.Search.withQuery(query).then(setResponse)
      router.push(`/search/?q=${query}`)
    }
    if (query === '') {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setShowDropdown(false)
    setQuery('')
  }

  const autoCompleteHandler = async (query) => {
    const response = await axios.post(
      `${NinaSdk.client.endpoint}/suggestions`,
      { query }
    )
    setSuggestions(response.data)
  }

  const changeHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const search = e.target.value

    setQuery(search)
    setShowDropdown(search !== '')

    if (search !== '') {
      autoCompleteHandler(search)
    } else {
      setSuggestions([])
    }
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
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Enter') {
      setQuery('')
      handleSubmit(e)
    }
  }

  return (
    <>
      <DesktopNavSearch
        handleSubmit={handleSubmit}
        changeHandler={changeHandler}
        handleInputFocus={handleInputFocus}
        query={query}
        suggestions={suggestions}
        dropdownRef={dropdownRef}
        searchInputRef={searchInputRef}
        showDropdown={showDropdown}
        autoCompleteResults={autoCompleteResults}
        keyHandler={(e) => keyHandler(e)}
        setShowDropdown={setShowDropdown}
        setQuery={setQuery}
      />
    </>
  )
}

const DesktopNavSearch = ({
  handleSubmit,
  changeHandler,
  handleInputFocus,
  query,
  suggestions,
  dropdownRef,
  searchInputRef,
  showDropdown,
  setShowDropdown,
  setQuery,
  autoCompleteResults,
  keyHandler,
}) => {
  return (
    <NavSearchContainer>
      <form onSubmit={(e) => handleSubmit(e)}>
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
      </form>
      {showDropdown && (
        <DropdownContainer ref={dropdownRef}>
          {autoCompleteResults.map((result, index) => {
            if (result.visible) {
              return (
                <DropdownWrapper key={index}>
                  <SearchDropdown
                    category={result.name}
                    searchData={suggestions}
                    hasResults={result.visible}
                    onKeyDown={(e) => keyHandler(e)}
                    setShowDropdown={setShowDropdown}
                    setQuery={setQuery}
                  />
                </DropdownWrapper>
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
    </NavSearchContainer>
  )
}

const NavSearchContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const SearchInputWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100vw',
}))
const SearchInput = styled('input')(({ theme }) => ({
  border: 0,
  borderBottom: '1px solid #000000',
  width: '15vw',
  marginRight: '20px',
  outline: 'none !important',
  padding: '4px',
  borderRadius: 0,
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.transparent}`,
  '&:focus': {
    border: `1px solid ${theme.palette.black}`,
  },
  '&::placeholder': {
    overflow: 'visible',
  },
  [theme.breakpoints.down('md')]: {
    margin: '15px 0',
    padding: '2px 0',
    width: '100vw',
    fontSize: '18px',
    display: 'none',
  },
}))
const DropdownContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  width: '15vw',
  zIndex: '100',
  position: 'absolute',
  overflowY: 'scroll',
  textAlign: 'left',
  marginRight: '20px',
  backgroundColor: theme.palette.offWhite,
  padding: '0',
  border: `1px solid ${theme.palette.black}`,
  borderTop: 'none',
  '&::-webkit-scrollbar': {
    display: 'none !important',
  },
}))

const DropdownWrapper = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  webkitOverflowScrolling: 'touch',
}))

export default NavSearch
