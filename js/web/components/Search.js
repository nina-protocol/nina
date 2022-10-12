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
  const router = useRouter()
  console.log('router.query', router.query)
  const { searchResults, searchQuery } = props
  const [query, setQuery] = useState(searchQuery?.q)
  const [filter, setFilter] = useState()
  const [response, setResponse] = useState(searchResults)
 
  const [fetchedResponse, setFetchedResponse] = useState(false)

  const [activeView, setActiveView] = useState(0)

  const [searchResultsCategories, setSearchResultsCategories] = useState([
    { type: 'searchResultArtists', data: response?.artists, fetched: false },
    { type: 'searchResultReleases', data: response?.releases, fetched: false },
    { type: 'searchResultHubs', data: response?.hubs, fetched: false },
  ])
  const [views, setViews] = useState([
    { name: 'all', playlist: null, visible: true },
    { name: 'artists', playlist: null, visible: false },
    { name: 'releases', playlist: null, visible: false },
    { name: 'hubs', playlist: null, visible: false },
  ])
  console.log('views', views)

  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
  }, [])

  useEffect(() => {
 

    if (searchQuery) {
      const query = searchQuery.q
      const filter = searchQuery.type
      setQuery(query)
      setFilter(filter)

    }
    if (searchResults) {
      setResponse(searchResults)
      setFetchedResponse(true)
      console.log('yes lawd' )    }
  }, [searchResults, searchQuery])
  // console.log('views.slice()', views.slice())
  useEffect(() => {
    let viewIndex
    let updatedView = views.slice()

    let resultIndex
    let updatedSearchResultsCategories = searchResultsCategories.slice()
    console.log('updatedView', updatedView)
    
    if (fetchedResponse) {
      const responseLength = [...response?.artists, ...response?.releases, ...response?.hubs].length
      console.log('responseLength', responseLength)
      viewIndex = updatedView?.findIndex((view) => view.name === 'all')
      updatedView[viewIndex].name = `all (${responseLength})`
      updatedView[viewIndex].visible = true
      
    }
    if (fetchedResponse && response?.artists?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'artists')
      updatedView[viewIndex].name = `artists (${response?.artists?.length})`
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultArtists'
      )
      updatedSearchResultsCategories[resultIndex].fetched = true
    }
    if (fetchedResponse && response?.releases?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'releases')
      updatedView[viewIndex].name = `releases (${response?.releases?.length})`
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultReleases'
      )
      updatedSearchResultsCategories[resultIndex].fetched = true
    }
    if (fetchedResponse && response?.hubs?.length > 0) {
      viewIndex = updatedView.findIndex((view) => view.name === 'hubs')
      updatedView[viewIndex].name = `hubs (${response?.hubs?.length})`
      updatedView[viewIndex].visible = true
      resultIndex = updatedSearchResultsCategories.findIndex(
        (result) => result.type === 'searchResultHubs'
      )
    // now filter everything by type

    setViews(...updatedView)
      // updatedSearchResultsCategories[resultIndex].fetched = true
    }
  }, [response, views, fetchedResponse])

  // useEffect(() => {

  //   let updatedView
  //   let updatedSearchResultsCategories = searchResultsCategories.slice()
  //   if (filter) {
  //     const filteredResults = searchResultsCategories.find(
  //       (result) => result.type === `${filter}`
  //     )
  //     console.log('filteredResults', filteredResults)
  //     updatedSearchResultsCategories = [filteredResults]
  //     updatedView = updatedView.filter((view) => view.name === filter)
  //   }
  //   setViews(updatedView)
  // }, [views, filter])


  const viewHandler = (event) => {
    const index = parseInt(event.target.id)
    console.log('fetchedResponsssssssse', fetchedResponse)
    console.log('response?.artisssssts', response?.artists.length > 0)
    setActiveView(index)
  }

  return (
    <SearchPageContainer>
      <SearchInputContainer>
        <SearchInputWrapper>
          <Typography>{`Search results for ${query}`}</Typography>
        </SearchInputWrapper>
      </SearchInputContainer>
      {fetchedResponse && (
        <Box sx={{ py: 1 }}>
          <TabHeader
            isActive={activeView}
            viewHandler={viewHandler}
            profileTabs={views}
          />
        </Box>
      )}
      <SearchAllResultsWrapper>
        <ResponsiveSearchResultContainer>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}

          {fetchedResponse && activeView === 0 && (
            <AllResultsContainer sx={{ overflow: 'auto' }}>
              <AllResultsWrapper>
                <ReusableTable
                  tableType="searchResultArtists"
                  releases={response?.artists}
                  hasOverflow={false}
                />
              </AllResultsWrapper>
              <AllResultsWrapper>
                <ReusableTable
                  tableType="searchResultReleases"
                  releases={response?.releases}
                  hasOverflow={false}
                />
              </AllResultsWrapper>
              <AllResultsWrapper>
                <ReusableTable
                  tableType="searchResultHubs"
                  releases={response?.hubs}
                  hasOverflow={false}
                />
              </AllResultsWrapper>
            </AllResultsContainer>
          )}

          {fetchedResponse && activeView === 1 && response?.artists.length > 0 && (
            <ResultsWrapper>
              <ReusableTable
                tableType="searchResultArtists"
                releases={response?.artists}
                hasOverflow={true}
              />
            </ResultsWrapper>
          )}

          {fetchedResponse && activeView === 2 && response?.releases.length > 0 && (
            <ResultsWrapper>
              <ReusableTable
                tableType="searchResultReleases"
                releases={response?.releases}
                hasOverflow={true}
              />
            </ResultsWrapper>
          )}

          {fetchedResponse && activeView === 3 && response?.hubs.length > 0 && (
            <ResultsWrapper>
              <ReusableTable
                tableType={'searchResultHubs'}
                releases={response?.hubs}
                hasOverflow={true}
              />
            </ResultsWrapper>
          )}
          {query?.length > 0 &&
            fetchedResponse &&
            response?.artists?.length === 0 &&
            response?.releases?.length === 0 &&
            response?.hubs?.length === 0 && (
              <Typography>No results found</Typography>
            )}
        </ResponsiveSearchResultContainer>
      </SearchAllResultsWrapper>
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

const SearchAllResultsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  overflow: 'auto',
}))

const ResponsiveSearchResultContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  maxWidth: theme.maxWidth,

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

const AllResultsContainer = styled(Box)(({ theme }) => ({
  overflow: 'unset',
}))

const AllResultsWrapper = styled(Box)(({ theme }) => ({
  marginBottom: '20px',
}))

const ResultsWrapper = styled(Box)(({ theme }) => ({
  overflow: 'visible',
}))
export default Search
