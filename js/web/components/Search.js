import NinaSdk from '@nina-protocol/js-sdk'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import { useCallback } from 'react'
import Autocomplete from '@mui/material/Autocomplete';
import Dots from './Dots'
import Link from 'next/link'
import axios from 'axios'

const Search = () => {
  // const {
  //     getRootProps,
  //     getInputLabelProps,
  //     getInputProps,
  //     getListboxProps,
  //     getOptionProps,
  //     groupedOptions,
  // } = useAutocomplete({
  //     id: 'nina-search',
  //     options: [response],
  //     getOptionLabel: (option) => option
  // })

  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(undefined)
  const [suggestions, setSuggestions] = useState([])
  const [artist, setArtist] = useState([])
  const [fetchedResponse, setFetchedResponse] = useState(undefined)
  const [allResults, setAllResults] = useState(undefined)
  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
    console.log('NinaSdk.client', NinaSdk)
  }, [])

  const updateResponse = useCallback(
    (res) => {
      console.log('response', response)
    },
    [response]
  )
const autoCompleteUrl = 'https://dev.api.ninaprotocol.com/v1/suggestions'
  useEffect(() => {

    // const handleSuggestions = async () => {
    //   const response =  await NinaestQuery(Sdk.Search.suggquery)
    //   console.log('response :>> ', response);
    //   setSuggestions(response)
    // }
    // if (query) {
    //   handleSuggestions()
    // }
   
    const fetchAllResults = async () => {
      await NinaSdk.Search.withQuery(query).then(setAllResults)
    }
    if(!allResults){
      fetchAllResults()
    }
    if (query) {
      
      handleAutoComplete(query)
    }
  //  console.log('suggestions :>> ', suggestions);
  }, [query, allResults])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFetchedResponse(false)

    if (e.target.value !== null || e.target.value !== '') {
      setQuery(e.target.value)
      await NinaSdk.Search.withQuery(query).then(setResponse)
      setFetchedResponse(true)
    }

    if (query === '') {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setQuery('')
    updateResponse()

  }
  const handleAutoComplete = async (query) => {
    const fetchedSuggestions = []
    const response = await axios.post(autoCompleteUrl, {query})
    Object.keys(response.data).forEach(key => {
      fetchedSuggestions.push(response.data[key])
    })
    const artists = fetchedSuggestions.map((suggestion) => suggestion.map((item) => item.name))
    console.log('artists', artists.map((artist) => artist))
    setSuggestions(artists.map((artist) => artist[0]))
  }
  const changeHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuery(e.target.value)
    
    if (e.keyCody === 13) {
      setQuery('')
    }
  }
  const array = ['jack', 'jill', 'john', 'jane']
  return (
    <Box sx={{ height: '60vh', width: '960px' }}>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <SearchInputWrapper>
          {/*  */}
      <Autocomplete 
      id="nina-search"
      options={suggestions}
      getOptionLabel={(option) => option}
      renderInput={(params) => 
        <TextField
        {...params}
        className="input"
        fullWidth
        onChange={(e) => changeHandler(e)}
        label="Search for anything..."
        variant="standard"
        // value={query}
        autoComplete={'off'}
      />
      } 
      /> 
        </SearchInputWrapper>
      </Form>
      <SearchResultsWrapper>
        <ResponsiveSearchResultContainer>
          {fetchedResponse === false && (
            <ResponsiveDotContainer>
              <Box sx={{ width: '100%', paddingTop: '25%', margin: 'auto' }}>
                <Dots />
              </Box>
            </ResponsiveDotContainer>
          )}
          {fetchedResponse === true &&
            response.artists.length === 0 &&
            response.releases.length === 0 &&
            response.hubs.length === 0 && (
              <>
                <Typography>No results found</Typography>
              </>
            )}
          {fetchedResponse && response.artists.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 'bold' }}>ARTISTS</Typography>
              {response?.artists.map((artist) => (
                <Link href={`/profiles/${artist.publicKey}`}>
                  <a>
                    <Typography>{artist.name}</Typography>
                  </a>
                </Link>
              ))}
            </>
          )}
        </ResponsiveSearchResultContainer>
        <ResponsiveSearchResultContainer>
          {fetchedResponse && response.releases.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 'bold' }}>RELEASES</Typography>
              {response?.releases.map((release) => (
                <Link href={`/${release.publicKey}`}>
                  <Typography>
                    {' '}
                    <a>{release.title} </a>
                  </Typography>
                </Link>
              ))}
            </>
          )}
        </ResponsiveSearchResultContainer>
        <ResponsiveSearchResultContainer>
          {fetchedResponse && response.hubs.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 'bold' }}>HUBS</Typography>
              {response?.hubs.map((hub) => (
                <Typography>{hub.displayName}</Typography>
              ))}
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

export default Search
