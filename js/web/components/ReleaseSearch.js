import {useState} from "react";
import {styled} from "@mui/material/styles";
import {Typography, Box} from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
 import axios from "axios";


import ninaCommon from 'nina-common'

const {NinaClient} = ninaCommon.utils

let path = NinaClient.endpoints.api
const ReleaseSearch = (props) => {
  const {setSearchResults} = props
  const [query, setQuery] = useState(null);

  const handleChange = (event) => { 
    console.log('event.target.value :>> ', event.target.value);
    setQuery(event.target.value)
  };

  const handleSearch = async (e, query) => {
    e.preventDefault()
    console.log('query :>> ', encodeURIComponent(query));
    const encodedQuery = encodeURIComponent(query)
    path += `/releases/search?s=${encodedQuery}`

    const response = await axios.get(path)
    const data = response.data
    if (data.releases) {
      const ids = data.releases.map(release => release)

      const metadataResult = await fetch(
        `${NinaClient.endpoints.api}/metadata/bulk`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ids}),
        }
      );
      const metadataJson = await metadataResult.json();

      setQuery(null)
      console.log('metadataJson :>> ', metadataJson);
      setSearchResults(metadataJson)
    }


  }

  return (
    <SearchWrapper>
      <form></form>
      <TextField value={query} fullWidth label="Search by Artist" id="fullWidth" onChange={e => handleChange(e)} />
      <Button
        variant='outlined'
        onClick={e => handleSearch(e, query)}
        disabled={ query?.length === 0 ? true : false}
      >
        Search
      </Button>
    </SearchWrapper>
  );
}

const SearchWrapper = styled(Box)(() => ({
  marginBottom: "15px",
  display: 'flex'
}));



export default ReleaseSearch
