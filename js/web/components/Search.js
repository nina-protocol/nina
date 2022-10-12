import NinaSdk from '@nina-protocol/js-sdk'
import { useEffect, useState, useRef } from 'react'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
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
  const [searchFilter, setSearchFilter] = useState()
  const [response, setResponse] = useState(searchResults)

  const [fetchedResponse, setFetchedResponse] = useState(false)

  const [activeView, setActiveView] = useState(0)
  const [responseLength, setResponseLength] = useState(0)
  // const [searchResultFilters, setSearchResultFilters] = useState([
  // 'all','artists','releases','hubs'
  // ])

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
      setSearchFilter(filter)
    }
    if (searchResults) {
      setResponse(searchResults)
      setFetchedResponse(true)
    }
   
  }, [searchResults, searchQuery])


  useEffect(() => {
    if(searchFilter === 'artists') {
      setActiveView(1)
    }
    if(searchFilter === 'releases') {
      setActiveView(2)
    }
    if(searchFilter === 'hubs') {
      setActiveView(3)
    } 
    console.log('activvvvvv', activeView)
  }, [searchFilter])


  return (
    <SearchPageContainer>
      <SearchInputContainer>
        <SearchInputWrapper>
          <Typography>{`Search results for ${query}`}</Typography>
        </SearchInputWrapper>
      </SearchInputContainer>
      <Box sx={{display: 'flex', flexDirection: 'row'}}>
      <SearchResultFilter
            // id={index}
            isClicked={activeView === 0}
            onClick={() => setActiveView(0)}
            
            >
              {`All (${response?.artists.length + response?.releases.length + response?.hubs.length})`}
            </SearchResultFilter>
      {
        Object.keys(response).map((filter, index) => {
          console.log('filter', filter)
          console.log('filtersss', response?.[filter]?.length)
          
          return (
            <SearchResultFilter
            id={index}
            isClicked={activeView === (index + 1)}
            onClick={() => setActiveView(index + 1)}
            disabled={response?.[filter]?.length === 0}
            >
              {`${filter} (${response?.[filter]?.length})`}
            </SearchResultFilter>
          )
        })
      }

      </Box>

      <SearchAllResultsWrapper>
        <ResponsiveSearchResultContainer>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}

        {
          activeView === 0 && fetchedResponse && (
            Object.keys(searchResults).map((key, index) => {
              const type = key.charAt(0).toUpperCase() + key.slice(1)
              const data = searchResults[key]
              console.log('data.type', data)
              return (
                <ResultsWrapper>

                <ReusableTable
                  tableType={`searchResult${
                    type.charAt(0).toUpperCase() + type.slice(1)
                  }`}
                  releases={data}
                  hasOverflow={false}
                  />
                  </ResultsWrapper>
              )
            })
          )
        }

          {fetchedResponse && activeView === 1 && response?.artists.length > 0 && (
            <ResultsWrapper>
              <ReusableTable
                tableType="filteredSearchResultArtists"
                releases={response?.artists}
                hasOverflow={true}
              />
            </ResultsWrapper>
          )}

          {fetchedResponse &&
            activeView === 2 &&
            response?.releases.length > 0 && (
              <ResultsWrapper>
                <ReusableTable
                  tableType="filteredSearchResultReleases"
                  releases={response?.releases}
                  hasOverflow={true}
                />
              </ResultsWrapper>
            )}

          {fetchedResponse && activeView === 3 && response?.hubs.length > 0 && (
            <ResultsWrapper>
              <ReusableTable
                tableType={'filteredSearchResultHubs'}
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
  width: theme.maxWidth,
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

const SearchResultFilter = styled(Button)(({theme, isClicked}) => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: isClicked ? 'bold' : 'normal',
  color: '#000',
  textAlign: 'left',
  alignItems:'left'
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
