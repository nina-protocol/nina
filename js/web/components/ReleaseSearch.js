import { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import nina from "@nina-protocol/nina-sdk";
import Dots from './Dots'

const { NinaContext, ReleaseContext } = nina.contexts

const ReleaseSearch = () => {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState(null)
  const { ninaClient } = useContext(NinaContext)
  const { getReleasesBySearch, searchResults, resetSearchResults } =
    useContext(ReleaseContext)
  let path = ninaClient.endpoints.api

  useEffect(() => {
    getArtists()
  }, [])

  const getArtists = async () => {
    console.log('ninaClient.endpoints :>> ', ninaClient.endpoints);
    const response = await axios.get(path + '/releases/artists')
    const data = response.data
    setArtists(data.artists)
  }

  const handleOptionSelect = (event, value, reason) => {
    if (event) {
      if (reason === 'clear') {
        resetSearchResults()
        setQuery('')
      } else if (reason === 'reset') {
        getReleasesBySearch(value)
        setQuery('')
      } else if (reason === 'input') {
        setQuery(value)
      }
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    getReleasesBySearch(query)
    setQuery('')
  }

  const handleReset = () => {
    resetSearchResults()
    setQuery('')
  }

  return (
    <SearchWrapper>
      <Form onSubmit={(e) => handleSubmit(e)} style={{ width: '100%' }}>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={artists || []}
          onInputChange={(e, v, r) => handleOptionSelect(e, v, r)}
          fullWidth
          inputValue={query}
          freeSolo={true}
          renderInput={(params) => (
            <InputWrapper>
              <TextField
                className="input"
                {...params}
                fullWidth
                label="Search by Artist"
                id="fullWidth"
                variant="standard"
                // onChange={(e) => handleChange(e)}
              />
            </InputWrapper>
          )}
        />
      </Form>

      {searchResults.pending && (
        <Box>
          <Dots msg={`searching for ${searchResults.query}`} />
        </Box>
      )}

      {searchResults.searched && (
        <ResultCopy>
          <Typography align="left">
            {searchResults.releaseIds.length} results for{' '}
            <span>{searchResults.query}</span>
          </Typography>

          <CloseIcon onClick={handleReset} />
        </ResultCopy>
      )}
    </SearchWrapper>
  )
}

const SearchWrapper = styled(Box)(() => ({
  marginBottom: '15px',
}))

const Form = styled('form')(() => ({
  width: '100%',
  display: 'flex',
}))

const ResultCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& span': {
    color: theme.palette.blue,
  },
}))

const InputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  [`& .input`]: {
    ...theme.helpers.baseFont,
    marginBottom: '8px',
    width: '100%',
    textTransform: 'capitalize',
    position: 'relative',
    '& input': {
      textAlign: 'left',
      '&::placeholder': {
        color: theme.palette.red,
      },
    },
  },
}))

export default ReleaseSearch
