import {useState, useRef, useEffect, useContext} from "react";
import {styled} from "@mui/material/styles";
import {Typography, Box} from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';

import axios from "axios";


import ninaCommon from 'nina-common'

const {ReleaseContext} = ninaCommon.contexts;
const {NinaClient} = ninaCommon.utils

let path = NinaClient.endpoints.api
const ReleaseSearch = (props) => {
  const {setSearchResults} = props
  const [query, setQuery] = useState(null);
  const [artists, setArtists] = useState(null)
  
  const {
    releaseState,
    getReleasesBySearch,
    filterSearchResults,
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

  const handleSubmit= async (e) => {
    e.preventDefault()
   const resultIds = await getReleasesBySearch(query)
   const resultData = filterSearchResults(resultIds)
   console.log('resultData :>> ', resultData);

    e.target.reset()
  }

  return (
    <SearchWrapper>
        {artists && (
      <Form onSubmit={e => handleSubmit(e)} style={{width: '100%'}}>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={artists}
          sx={{width: 300}}
          onInputChange={(e, v)=> handleOptionSelect(e, v)}
          fullWidth
          renderInput={(params) =>  <TextField {...params} value={query} fullWidth label="Search by Artist" id="fullWidth" onChange={e => handleChange(e)} />}
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
    </SearchWrapper>
  );
}

const SearchWrapper = styled(Box)(() => ({
  marginBottom: "15px",
}));

const Form = styled('form')(() => ({
  width: '100%',
  display: 'flex'
}));



export default ReleaseSearch
