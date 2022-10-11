import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import Button from '@mui/material'
import {styled} from '@mui/system'
import {Tab} from '@mui/material'
const SearchDropdown = ({ searchData, category, hasResults, clickHandler, onKeyDown }) => {
  let rows

  if (category === 'artists') {
    rows = searchData?.artists?.map((data) => {
      const artistName = data?.name
      const artistLink = `/profiles/${data?.publicKey}`

      let formattedData = {
        name: artistName,
        link: artistLink,
        category: 'artist',
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
        category: 'release',
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
        category: 'hub',
      }

      return formattedData
    })
  }
  return (
    <>
      {hasResults === true && (
        <>
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
        </>
      )}    
    </>
  )
}

const SearchDropdownResult= styled('button')(({ theme }) => ({
  outline: 'none'
}))

export default SearchDropdown