import NinaSdk from '@nina-protocol/nina-sdk'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Box } from '@mui/system'
import axios from 'axios'
import { Typography } from '@mui/material'
import { useCallback } from 'react'
import Autocomplete from '@mui/material'
const Search = () => {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(undefined)
  useEffect(() => {
    NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID
    )
    console.log('NinaSdk', NinaSdk.Search)
    console.log('cool')
  }, [])

  const updateResponse = useCallback(res => {
    console.log('response', response)
  }, [response])
  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setQuery(e.target.value)
    await NinaSdk.Search.withQuery(query).then(setResponse).then(setQuery(''))
    updateResponse()
    console.log('query', query)
    console.log('response', response)
  }
  return (
    <Box>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <SearchInputWrapper>
          <Autocomplete
            className="input"
          
            fullWidth
            onChange={(e) => setQuery(e.target.value)}
            label="Search for anything..."
            id="fullWidth"
            variant="standard"
          />
        </SearchInputWrapper>
      </Form>
      <Box>
        <Box>
            <Typography sx={{fontWeight: 'bold'}}>ARTISTS</Typography>
            {
            response?.artists.map((artist) => (
                <Typography>{artist.name}</Typography>
            ))
        }
        </Box>
      <Box>
        <Typography sx={{fontWeight: 'bold'}}>RELEASES</Typography>
        {
            response?.releases.map((release) =>(
                <Typography>{release.title}</Typography>
            ))
        }
      </Box>
      <Box>
        <Typography sx={{fontWeight: 'bold'}}>HUBS</Typography>
        {
            response?.hubs.map((hub) =>(
                <Typography>{hub.displayName}</Typography>
            ))
        }
      </Box>
      </Box>
    </Box>
  )
}

const SearchInputWrapper = styled(Box)(({ theme }) => ({}))
const Form = styled('form')(({ theme }) => ({
  width: '50vw',
}))
export default Search
