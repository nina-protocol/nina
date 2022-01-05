import { useState, useRef, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";

import axios from "axios";

import ninaCommon from "nina-common";

const { ReleaseContext } = ninaCommon.contexts;
const { NinaClient } = ninaCommon.utils;
const { Dots } = ninaCommon.components;

let path = NinaClient.endpoints.api;
const ReleaseSearch = () => {
  const [query, setQuery] = useState(null);
  const [artists, setArtists] = useState(null);
  const [resultCount, setResultCount] = useState(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const {
    releaseState,
    getReleasesBySearch,
    searchResults,
    filterSearchResults,
    resetSearchResults,
  } = useContext(ReleaseContext);

  useEffect(() => {
    getArtists();
  }, []);

  const getArtists = async () => {
    const response = await axios.get(path + "/releases/artists");
    const data = response.data;
    setArtists(data.artists);
  };

  const handleOptionSelect = (event, value, reason) => {
    console.log(event, value, reason)
    if (event) {
      if (reason === "clear") {
        resetSearchResults();
        setQuery(null);
      } else if (reason === "reset") {
        getReleasesBySearch(value);
      } else if (reason === "input") {
        setQuery(value)
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('e', query, e)
    getReleasesBySearch(query);
  };

  const handleReset = () => {
    resetSearchResults();
    setQuery(null);
    setResultCount(null);
    setResultCount(null);
    formRef.current.value = "";
  };

  return (
    <SearchWrapper>
      {artists && (
        <Form
          ref={formRef}
          onSubmit={(e) => handleSubmit(e)}
          style={{ width: "100%" }}
        >
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={artists}
            onInputChange={(e, v, r) => handleOptionSelect(e, v, r)}
            fullWidth
            ref={formRef}
            value={query}
            blurOnSelect
            freeSolo={true}
            renderInput={(params) => (
              <InputWrapper>
                <TextField
                  className="input"
                  {...params}
                  ref={inputRef}
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
      )}

      {searchResults.pending && (
        <Box>
          <Dots msg={`searching for ${searchResults.query}`} />
        </Box>
      )}

      {searchResults.searched && (
        <ResultCopy>
          <Typography align="left">
            {searchResults.releaseIds.length} results for{" "}
            <span>{searchResults.query}</span>
          </Typography>

          <CloseIcon onClick={handleReset} />
        </ResultCopy>
      )}
    </SearchWrapper>
  );
};

const SearchWrapper = styled(Box)(() => ({
  marginBottom: "15px",
}));

const Form = styled("form")(() => ({
  width: "100%",
  display: "flex",
}));

const ResultCopy = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  "& span": {
    color: theme.palette.blue,
  },
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  [`& .input`]: {
    ...theme.helpers.baseFont,
    marginBottom: "8px",
    width: "100%",
    textTransform: "capitalize",
    position: "relative",
    "& input": {
      textAlign: "left",
      "&::placeholder": {
        color: theme.palette.red,
      },
    },
  },
}));

export default ReleaseSearch;
