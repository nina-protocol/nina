import NinaSdk from '@nina-protocol/js-sdk'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'

import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'

import Dots from './Dots'

import dynamic from 'next/dynamic'

const ReusableTable = dynamic(() => import('./ReusableTable'))

const Search = (props) => {
  const { searchResults, searchQuery } = props
  const [query, setQuery] = useState(searchQuery?.q)
  const [searchFilter, setSearchFilter] = useState()
  const [response, setResponse] = useState(searchResults)

  const [fetchedResponse, setFetchedResponse] = useState(false)

  const [activeView, setActiveView] = useState(0)

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
                  />
                )
              })
            }
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

  return (
    <SearchPageContainer>
      <SearchHeaderContainer>
        <SearchHeaderWrapper>
          <Typography>{`Search results for ${query}`}</Typography>
        </SearchHeaderWrapper>
      </SearchHeaderContainer>
      <>
      <SearchResultFilterContainer>
        <SearchResultFilter
          isClicked={activeView === 0}
          onClick={() => setActiveView(0)}
        >
          {`All (${
            response?.artists.length +
            response?.releases.length +
            response?.hubs.length
          })`}
        </SearchResultFilter>

        
        {searchResults &&
          Object.keys(response).map((filter, index) => {
            return (
              <SearchResultFilter
                id={index}
                isClicked={activeView === index + 1}
                onClick={() => setActiveView(index + 1)}
                disabled={response?.[filter]?.length === 0}
              >
                {`${filter} (${response?.[filter]?.length})`}
              </SearchResultFilter>
            )
          })}
        
        </SearchResultFilterContainer>
      </>

      <>
        <>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}

          {fetchedResponse && (
            <>{renderTables(activeView)}</>
          )}
          {query?.length > 0 &&
            fetchedResponse &&
            response?.artists?.length === 0 &&
            response?.releases?.length === 0 &&
            response?.hubs?.length === 0 && (
              <Typography>No results found</Typography>
            )}
        </>
      </>
    </SearchPageContainer>
  )
}

const SearchPageContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  justifyItems: 'center',
  textAlign: 'center',
  minWidth: theme.maxWidth,
  maxWidth: theme.maxWidth,
  height: '86vh',
  overflowY: 'hidden',
  margin: '75px auto',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    alignItems: 'center',
    marginTop: '50px',
    paddingTop: 0,
    minHeight: '100% !important',
    maxHeight: '80vh',
    overflow: 'hidden',
    marginLeft: 0,
  },
}))

const SearchHeaderContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',

  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
}))
const SearchHeaderWrapper = styled(Box)(({ theme }) => ({

  py: 5,
  pl: 1,
  pb: 1,
  maxWidth: '100vw',
  minHeight: '50px',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'no-wrap',
    height: '25px',
  },
}))
const Form = styled('form')(({ theme }) => ({}))


const SearchAllResultsWrapper = styled(Box)(({ theme }) => ({
  minWidth: theme.maxWidth,
  textAlign: 'left',
  overflow: 'auto',
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    minWidth: 'unset',
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
  [theme.breakpoints.down('md')]: {
  }
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
  [theme.breakpoints.down('md')]: {
    fontSize: '13px',
  },
}))

const ResultsWrapper = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  paddingBottom: '100px'
}))
export default Search
