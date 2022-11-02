import { Box, Typography } from '@mui/material'
import { useRef, useEffect } from 'react'
import { styled } from '@mui/system'

const SearchDropdown = ({
  searchData,
  category,
  hasResults,
  clickHandler,
  onKeyDown,
}) => {
  const searchDropdownRef = useRef(null)
  useEffect(() => {
    const node = searchDropdownRef.current
    node.addEventListener('keydown', (e) => {
      const active = document.activeElement
      if (e.keyCode === 40 && active.nextSibling) {
        active.nextSibling.focus()
      }
      if (e.keyCode === 38 && active.previousSibling) {
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
        displayName: artistName,
        name: artistName,
        link: artistLink,
        category: 'artists',
      }

      return formattedData
    })
  }

  if (category === 'releases') {
    console.log(searchData)
    rows = searchData?.releases?.map((data) => {
      const releaseName = data?.title
      const releaseLink = `/${data?.publicKey}`
      const artistName = data?.artist
      let formattedData = {
        displayName: `${artistName} - ${releaseName}`,
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
        displayName: hubName,
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
        <SearchResultsWrapper id="grid" ref={searchDropdownRef}>
          <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {category}
          </Typography>
          {rows?.map((row, index) => (
            <Box
              role="tab"
              id={row.category}
              tabIndex={0}
              onKeyDown={onKeyDown}
              key={index}
            >
              <a key={index} id={row.category} onClick={clickHandler}>
                <Typography id={row.category} data-value={row?.name}>{row?.displayName}</Typography>
              </a>
            </Box>
          ))}
        </SearchResultsWrapper>
      )}
    </>
  )
}

const SearchResultsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.lightTransparent,
  padding: '10px 0',
  '&:focus': {
    backgroundColor: theme.palette.lightTransparent,
    outline: 'none',
  },
}))

export default SearchDropdown
