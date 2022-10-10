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
const TabHeader = dynamic(() => import('./TabHeader'))

const Search = (props) => {
  const { searchResults, searchQuery } = props
  const [query, setQuery] = useState(searchQuery?.q)
  const [response, setResponse] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchedResponse, setFetchedResponse] = useState(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputFocus, setInputFocus] = useState(false)
  const [activeView, setActiveView] = useState(0)
  const [autoCompleteResults, setAutocompleteResults] = useState([
    { name: 'artists', visible: false },
    { name: 'releases', visible: false },
    { name: 'hubs', visible: false },
  ])
  const [searchResultsCategories, setSearchResultsCategories] = useState([
    { type: 'searchResultArtists', data: response?.artists, fetched: false },
    { type: 'searchResultReleases', data: response?.releases, fetched: false },
    { type: 'searchResultHubs', data: response?.hubs, fetched: false },
  ])
  const [views, setViews] = useState([
    { name: 'all', playlist: undefined, visible: true },
    { name: 'artists', playlist: undefined, visible: false },
    { name: 'releases', playlist: undefined, visible: false },
    { name: 'hubs', playlist: null, visible: false },
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
    let viewIndex
    let updatedView = views.slice()
    let resultIndex
    let updatedSearchResultsCategories = searchResultsCategories.slice()
    if (response?.artists.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'artists')
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultArtists'
      )
      updatedSearchResultsCategories[resultIndex].fetched = true
    }
    if (response?.releases.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultReleases'
      )
      updatedSearchResultsCategories[resultIndex].fetched = true
    }
    if (response?.hubs.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultHubs'
      )
      updatedSearchResultsCategories[resultIndex].fetched = true
    }
  }, [response])

  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    setActiveView(index)
  }
  console.log('fetch', fetchedResponse)
  console.log('response?.artists', response?.artists)
  console.log('response?.artists', response?.releases)
  console.log('response?.artists', response?.hubs)
  console.log('searchCategories', searchResultsCategories)
  return (
    <SearchPageContainer>
      <SearchInputContainer>
        <SearchInputWrapper>
          <Typography>{`Search results for ${query}`}</Typography>
        </SearchInputWrapper>
      </SearchInputContainer>
      <TabHeader
        isActive={activeView}
        viewHandler={viewHandler}
        profileTabs={views}
      />
      <SearchResultsWrapper>
        <ResponsiveSearchResultContainer>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}
          {
            searchResults && (
              
          <>
        
              <>
                {searchResultsCategories.map((category, index) => {
                  if (category.fetched) {
                    return (
                      <Box key={index}>
                        <ReusableTable
                          data={category.data}
                          type={category.type}
                          searchQuery={query}
                        />
                      </Box>
                    )
                  }
                })}
              </>
          
          </>
            )
          }

          {activeView === 1 && response?.artists.length > 0 && (
            <>
              <ReusableTable
                tableType="searchResultArtists"
                releases={response?.artists}
              />
            </>
          )}

          {activeView === 2 && response?.releases.length > 0 && (
            <>
              <ReusableTable
                tableType="searchResultReleases"
                releases={response?.releases}
              />
            </>
          )}

          { activeView === 3 && response?.hubs.length > 0 && (
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
    height: '80vh',
  },
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
