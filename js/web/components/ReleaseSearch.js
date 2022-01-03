import {useState, useRef, useEffect, useContext} from "react";
import {styled} from "@mui/material/styles";
import {Typography, Box} from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';

import axios from "axios";


import ninaCommon from 'nina-common'

const {ReleaseContext} = ninaCommon.contexts;
const {NinaClient} = ninaCommon.utils
const {Dots} = ninaCommon.components;

let path = NinaClient.endpoints.api
const ReleaseSearch = (props) => {
  const [query, setQuery] = useState(null);
  const [artists, setArtists] = useState(null)
  const formRef = useRef(null)
  const inputRef = useRef(null)

  const {
    releaseState,
    getReleasesBySearch,
    filterSearchResults,
    filterRelatedForRelease,
    searchResults,
    setSearchResults,
    resetSearchResults,
    getRelatedForRelease
  } = useContext(ReleaseContext);

  useEffect(async () => {
    if (!artists) {
      const data =  await getArtists()
      setArtists(data)
    }
  }, [])
  const getArtists = async () => {
    const response = await axios.get(path + '/releases/artists')
    const data = response.data
    return data.artists
  }

  const handleChange = (event) => { 
    setQuery(event.target.value)
  };

  const handleOptionSelect = (event, value) => { 
    setQuery(value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
   await getReleasesBySearch(query)
    // e.target.reset()
  }

  const handleReset = () => {
    resetSearchResults()
  }

  useEffect(() => {
    if (searchResults.releaseIds.length > 0) {
      filterSearchResults(searchResults.releaseIds)
      // console.log('resultData :>> ', resultData)
      const related = filterRelatedForRelease(searchResults.releaseIds[0]);
      if (related) {
        setSearchResults({
          ...searchResults,
          releases: related
        })
      }
    }
  }, [releaseState, searchResults.releaseIds])

  return (
    <SearchWrapper>
        {artists && (
        <Form ref={formRef} onSubmit={e => handleSubmit(e)} style={{width: '100%'}}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={artists}
              // sx={{width: 300}}
              onInputChange={(e, v)=> handleOptionSelect(e, v)}
              fullWidth
              ref={formRef}
              renderInput={(params) =>  <TextField {...params} ref={inputRef} value={query} fullWidth label="Search by Artist" id="fullWidth" onChange={e => handleChange(e)} />}
              />
            <Button
              variant='outlined'
              type="submit"
              disabled={ query?.length === 0 ? true : false}
              >
              Search
            </Button>

          </Form>
        )}

      {searchResults.pending && (
        <Box>
          <Dots msg={`searching for ${searchResults.query}`} />
        </Box>
      )}

      {searchResults.searched && (
        <ResultCopy>
          <Typography align="left">
            {searchResults.releases.length} results for <span>{searchResults.query}</span>
          </Typography>

          <CloseIcon onClick={handleReset} />
        </ResultCopy>
      )}
    </SearchWrapper>
  );
}

const SearchWrapper = styled(Box)(() => ({
  marginBottom: "15px",
}));

const Form = styled('form')(() => ({
  width: '100%',
  display: 'flex',
}));

const ResultCopy = styled(Box)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
 '& span': {
   color: theme.palette.blue
 }
}));





export default ReleaseSearch
