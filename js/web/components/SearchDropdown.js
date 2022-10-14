import { Box, Typography } from '@mui/material'
import { useRef, useEffect } from 'react'
import {styled} from '@mui/system'

const SearchDropdown = ({ searchData, category, hasResults, clickHandler, onKeyDown }) => {
  const searchDropdownRef = useRef(null)
  useEffect(() => {
    const node = searchDropdownRef.current
    node.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if(e.keyCode === 40 && active.nextSibling) {
        active.nextSibling.focus()
      } if (e.keyCode === 38 && active.previousSibling) {
        active.previousSibling.focus()
      }
    })
  }, [])
  let rows

  if (category === 'artists') {
    rows = searchData?.artists?.map((data) => {
      const artistName = data?.name
      const artistLink = `/profiles/${data?.publicKey}`

      let formattedData = {
        name: artistName,
        link: artistLink,
        category: 'artists',
      }

      return formattedData
    })
  }

  if (category === 'releases') {
    rows = searchData?.releases?.map((data) => {
      const releaseName = data?.title
      const releaseLink = `/${data?.publicKey}`

      let formattedData = {
        name: releaseName,
        link: releaseLink,
        category: 'releases',
      }

      return formattedData
    })
  }

  if (category === 'hubs') {
    rows = searchData?.hubs?.map((data) => {
      const hubName = data?.displayName
      const hubLink = `/hubs/${data?.handle}`

      let formattedData = {
        name: hubName,
        link: hubLink,
        category: 'hubs',
      }

      return formattedData
    })
  }
  return (
    <>
      {hasResults === true && (
        <SearchResultsWrapper id='grid' ref={searchDropdownRef}>
          <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {category}
          </Typography>
          {rows?.map((row, index) => (
            <Box role="tab" tabIndex={0} onKeyDown={onKeyDown}>
            <a key={index} onClick={clickHandler}>
              <Typography  id={row.category} >{row?.name}</Typography>
            </a>
            </Box >
          ))}
        </SearchResultsWrapper>
      )}    
    </>
  )
}

const SearchResultsWrapper = styled(Box)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  '&:focus': {
    backgroundColor: 'rgba(255,255,255,0.8)',
    outline: 'none'
  }
}))



export default SearchDropdown