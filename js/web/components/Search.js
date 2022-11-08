import NinaSdk from '@nina-protocol/js-sdk'
import { useEffect, useState, useContext, useRef } from 'react'
import { styled } from '@mui/material/styles'
import axios from 'axios'
import { useRouter } from 'next/router'

import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'

import Dots from './Dots'

import dynamic from 'next/dynamic'

const SearchDropdown = dynamic(() => import('./SearchDropdown'))
const ReusableTable = dynamic(() => import('./ReusableTable'))

const Search = (props) => {
  const router = useRouter()
  const { searchResults, searchQuery } = props
  const [query, setQuery] = useState(searchQuery?.q)
  const { getHubs, hubState, featuredHubs, setFeaturedHubs } = useContext(
    Hub.Context
  )
  const { getSubscriptionsForUser } = useContext(Nina.Context)
  const { getReleasesRecent, releasesRecentState, filterReleasesRecent } =
    useContext(Release.Context)

  const dropdownRef = useRef()
  const searchInputRef = useRef()

  const [searchFilter, setSearchFilter] = useState()
  const [response, setResponse] = useState(searchResults)
  const [defaultResponse, setDefaultResponse] = useState([
    { name: 'Artists', data: undefined },
    { name: 'Releases', data: undefined },
    { name: 'Hubs', data: undefined },
  ])
  const [featuredHubPublicKeys, setFeaturedHubPublicKeys] = useState()
  const [releasesRecent, setReleasesRecent] = useState({})

  const [fetchedResponse, setFetchedResponse] = useState(false)

  const [activeView, setActiveView] = useState(0)

  const [defaultSearchView, setDefaultSearchView] = useState([
    { name: 'Artists', length: 0 },
    { name: 'Releases', length: 0 },
    { name: 'Hubs', length: 0 },
  ])
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)
  const [autoCompleteResults, setAutocompleteResults] = useState([
    { name: 'artists', visible: false },
    { name: 'releases', visible: false },
    { name: 'hubs', visible: false },
  ])

  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      const fetchFeaturedHubs = async () => {
        await getHubs()
        const response = await getSubscriptionsForUser(
          '7g2euzpRxm2A9kgk4UJ9J5ntUYvodTw4s4m7sL1C8JE'
        )
        const publicKeys = response.filter((sub) => {
          return sub.subscriptionType === 'hub'
        })
        setFeaturedHubPublicKeys(publicKeys)
      }
      getReleasesRecent()
      fetchFeaturedHubs()
    }
  }, [])

  useEffect(() => {
    setReleasesRecent(filterReleasesRecent())

    defaultSearchView[1].length = releasesRecent?.highlights?.length

    if (!searchQuery) {
      setActiveView(2)
    }
  }, [releasesRecentState])

  useEffect(() => {
    if (featuredHubPublicKeys) {
      const featured = []
      Object.values(featuredHubPublicKeys).forEach((sub) => {
        const hub = hubState[sub.to]
        if (hub) {
          featured.push(hub)
        }
      })
      setFeaturedHubs(featured)
      defaultSearchView[2].length = featured.length

      defaultResponse.Hubs = featured
    }
  }, [featuredHubPublicKeys, hubState])

  useEffect(() => {
    let defaultResponseIndex
    let defaultResponseCopy = defaultResponse.slice()
    let defaultSearchViewCopy = defaultSearchView.slice()
    if (!searchQuery) {
      if (releasesRecent?.highlights?.length > 0) {
        defaultResponseIndex = defaultResponseCopy.findIndex(
          (item) => item.name === 'Releases'
        )
        defaultResponseCopy[defaultResponseIndex].data =
          releasesRecent?.highlights
        defaultSearchViewCopy[defaultResponseIndex].length =
          releasesRecent?.highlights?.length
      }
      if (featuredHubs?.length > 0) {
        defaultResponseIndex = defaultResponseCopy.findIndex(
          (item) => item.name === 'Hubs'
        )
        defaultResponseCopy[defaultResponseIndex].data = featuredHubs
        defaultSearchViewCopy[defaultResponseIndex].length =
          featuredHubs?.length
      }
    }
    setDefaultResponse(defaultResponseCopy)
    setDefaultSearchView(defaultSearchViewCopy)
  }, [releasesRecent, featuredHubs])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.q
      const filter = searchQuery.type
      setQuery(query)
      setSearchFilter(filter)
    }
    if (searchResults) {
      setResponse(searchResults)
      setFetchedResponse(true)
    }
  }, [searchResults, searchQuery])

  useEffect(() => {
    if (searchFilter === 'artists') {
      setActiveView(1)
    }
    if (searchFilter === 'releases') {
      setActiveView(2)
    }
    if (searchFilter === 'hubs') {
      setActiveView(3)
    }
  }, [searchFilter])

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

  const suggestionsClickHandler = (search, searchFilter) => {
    setQuery('')

    router.push(
      `/search/?q=${search}${searchFilter ? `&type=${searchFilter}` : ''}`
    )
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

  const renderTables = (activeView) => {
    switch (activeView) {
      case 0:
        return (
          <SearchAllResultsWrapper>
            {Object.keys(searchResults).map((key, index) => {
              const type = key.charAt(0).toUpperCase() + key.slice(1)
              const data = searchResults[key]
              return (
                <ReusableTable
                  tableType={`searchResult${
                    type.charAt(0).toUpperCase() + type.slice(1)
                  }`}
                  items={data}
                  hasOverflow={false}
                  minHeightOverride={true}
                  key={index}
                />
              )
            })}
          </SearchAllResultsWrapper>
        )
      case 1:
        return (
          <ResultsWrapper>
            <ReusableTable
              tableType="filteredSearchResultArtists"
              items={response?.artists}
              hasOverflow={true}
            />
          </ResultsWrapper>
        )
      case 2:
        return (
          <ResultsWrapper>
            <ReusableTable
              tableType="filteredSearchResultReleases"
              items={response?.releases}
              hasOverflow={true}
            />
          </ResultsWrapper>
        )
      case 3:
        return (
          <ResultsWrapper>
            <ReusableTable
              tableType={'filteredSearchResultHubs'}
              items={response?.hubs}
              hasOverflow={true}
            />
          </ResultsWrapper>
        )
      default:
        break
    }
  }

  const renderDefaultSearchView = (activeView) => {
    switch (activeView) {
      case 0:
        return (
          <SearchAllResultsWrapper>
            {defaultSearchView.map((item, index) => {
              const type = item.name
              return (
                <ReusableTable
                  tableType={`defaultSearch${type}`}
                  items={defaultResponse[index]?.data}
                  hasOverflow={false}
                  key={index}
                />
              )
            })}
          </SearchAllResultsWrapper>
        )
      case 2:
        return (
          <ResultsWrapper>
            <ReusableTable
              tableType={'defaultSearchReleases'}
              items={defaultResponse[1].data}
              hasOverflow={true}
            />
          </ResultsWrapper>
        )
      case 3:
        return (
          <ResultsWrapper>
            <ReusableTable
              tableType={'defaultSearchHubs'}
              items={defaultResponse[2].data}
              hasOverflow={true}
            />
          </ResultsWrapper>
        )
      default:
        break
    }
  }
  const searchFilterHandler = (e, searchIndex, searchFilter) => {
    e.preventDefault()
    e.stopPropagation()
    history.pushState(null, '', `/search?q=${query}&type=${searchFilter}`)
    setActiveView(searchIndex)
  }
  return (
    <SearchPageContainer>
      <SearchContainer>
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
                      setQuery={setQuery}
                      setShowDropdown={setShowDropdown}
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
      </SearchContainer>
      <SearchHeaderContainer>
        <SearchHeaderWrapper>
          {searchQuery && (
            <Typography>{`Search results for ${searchQuery.q}`}</Typography>
          )}
        </SearchHeaderWrapper>
      </SearchHeaderContainer>
      <>
        <SearchResultFilterContainer>
          {searchQuery && (
            <SearchResultFilter
              isClicked={activeView === 0}
              onClick={() => setActiveView(0)}
            >
              {`All (${
                response?.artists?.length +
                response?.releases?.length +
                response?.hubs?.length
              })`}
            </SearchResultFilter>
          )}

          {searchResults &&
            Object.keys(response).map((filter, index) => {
              return (
                <SearchResultFilter
                  id={index}
                  isClicked={activeView === index + 1}
                  onClick={(e) => searchFilterHandler(e, index + 1, filter)}
                  disabled={response?.[filter]?.length === 0}
                  key={index}
                >
                  {`${filter} (${response?.[filter]?.length})`}
                </SearchResultFilter>
              )
            })}

          {!searchResults && !searchQuery && (
            <SearchResultFilter
              isClicked={activeView === 0}
              onClick={(e) => searchFilterHandler(e, 0, 'all')}
            >
              {releasesRecent?.highlights?.length + featuredHubs?.length > 0
                ? `All (${
                    releasesRecent?.highlights?.length + featuredHubs?.length
                  })`
                : 'All (0)'}
            </SearchResultFilter>
          )}

          {!searchResults &&
            !searchQuery &&
            defaultSearchView.map((filter, index) => {
              return (
                <SearchResultFilter
                  id={index}
                  isClicked={activeView === index + 1}
                  onClick={() => setActiveView(index + 1)}
                  disabled={filter.length === 0}
                  key={index}
                >
                  {filter.length > 0
                    ? `${filter.name} (${filter.length})`
                    : `${filter.name} (0)`}
                </SearchResultFilter>
              )
            })}
        </SearchResultFilterContainer>
      </>

      <>
        {!fetchedResponse && searchQuery && (
          <ResponsiveDotContainer>
            <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
              <Dots />
            </Box>
          </ResponsiveDotContainer>
        )}

        {fetchedResponse && <>{renderTables(activeView)}</>}
        {!searchQuery && <>{renderDefaultSearchView(activeView)}</>}

        {query?.length > 0 &&
          fetchedResponse &&
          response?.artists?.length === 0 &&
          response?.releases?.length === 0 &&
          response?.hubs?.length === 0 && (
            <Typography sx={{ marginTop: '20px' }}>No results found</Typography>
          )}
      </>
    </SearchPageContainer>
  )
}

const SearchPageContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  paddingTop: '4rem',
  width: theme.maxWidth,
  height: '79vh',
  overflowY: 'hidden',
  marginBottom: '65px',
  marginLeft: 'auto',
  marginRight: 'auto',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop: '50px',
    paddingTop: 0,
    minHeight: '100% !important',
    maxHeight: '60vh',
    overflow: 'hidden',
  },
}))
const DropdownContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  width: '75vw',
  zIndex: '100',
  position: 'absolute',
  overflowY: 'scroll',
  textAlign: 'left',
  marginLeft: '12%',
  backgroundColor: theme.palette.offWhite,
  padding: '0 2px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))
const DropdownWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  webkitOverflowScrolling: 'touch',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))
const SearchContainer = styled(Box)(({ theme }) => ({}))
const SearchInputWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    width: '75%',
  },
}))
const SearchInput = styled('input')(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    border: 0,
    borderBottom: '1px solid #000',
    outline: 'none !important',
    background: 'transparent',
    outline: 'none',
    borderRadius: 0,
    display: 'none',
    marginTop: '15px',
    padding: '2px 0',
    width: '100vw',
    maxWidth: theme.maxWidth,
    fontSize: '18px',
    display: 'flex',
  },
}))

const SearchHeaderWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    marginTop: '20px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}))
const SearchHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  justifyContent: 'start',
  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100vw',
  minHeight: '100px',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
    minHeight: '50px',
    height: '75px',
    paddingTop: '10px',
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

const SearchResultFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  maxWidth: theme.maxWidth,
  borderBottom: '1px solid #E5E5E5',
  [theme.breakpoints.down('md')]: {},
}))

const SearchResultFilter = styled(Button)(({ theme, isClicked }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: isClicked ? 'bold' : 'normal',
  color: '#000',
  textAlign: 'left',
  alignItems: 'left',
  display: 'flex',
  flexDirection: 'row',
  paddingTop: '1rem',
  paddingBottom: '1rem',
  [theme.breakpoints.down('md')]: {
    fontSize: '13px',
  },
}))

const SearchAllResultsWrapper = styled(Box)(({ theme }) => ({
  minWidth: theme.maxWidth,
  textAlign: 'left',
  overflowY: 'auto',
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '200px',
    minWidth: 'unset',
    overflowX: 'unset',
    minHeight: '40vh',
  },
}))

const ResultsWrapper = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '200px',
    minHeight: '40vh',
  },
}))
export default Search
