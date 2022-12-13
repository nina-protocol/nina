import { Box, Typography } from '@mui/material'
import { useRef, useEffect } from 'react'
import { styled } from '@mui/system'
import { useRouter } from 'next/router'
const SearchDropdown = ({
  searchData,
  category,
  hasResults,
  onKeyDown,
  setShowDropdown,
  setQuery,
}) => {
  const router = useRouter()
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
      let artistName = data?.name
      if (data?.publishesAs.length > 1) {
        let publishesAsString
        if (data?.publishesAs.length > 5) {
          publishesAsString = data?.publishesAs.slice(0, 5).join(', ') + '...'
        } else {
          publishesAsString = data?.publishesAs.join(', ')
        }
        artistName = `${artistName} (Publishes as: ${publishesAsString})`
      }

      const artistLink = `/profiles/${data?.account.publicKey}`

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

  if (category === 'accounts') {
    rows = searchData?.accounts?.map((data) => {
      const accountName = data?.displayName || data?.publicKey
      const accountKey = data?.publicKey
      const accountLink = `/profiles/${accountKey}`
      let formattedData = {
        displayName: accountName,
        link: accountLink,
      }
      return formattedData
    })
  }

  const suggestionsHandler = (e, link) => {
    e.preventDefault()
    e.stopPropagation()

    const clickedSuggestion = e.target.innerText

    if (clickedSuggestion) {
      setShowDropdown(false)
      setQuery('')
      router.push(link)
    }
  }
  return (
    <>
      {hasResults === true && (
        <SearchResultsWrapper id="grid" ref={searchDropdownRef}>
          <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {category}
          </Typography>
          {rows?.map((row, index) => (
            <SearchResult
              role="tab"
              id={row.category}
              tabIndex={0}
              onKeyDown={onKeyDown}
              key={index}
              sx={{ borderBottom: '1px solid #E5E5E5', py: '4px' }}
            >
              <a
                key={index}
                id={row.category}
                onClick={(e) => suggestionsHandler(e, row?.link)}
              >
                <Typography id={row.category} data-value={row?.name}>
                  {row?.displayName}
                </Typography>
              </a>
            </SearchResult>
          ))}
        </SearchResultsWrapper>
      )}
    </>
  )
}

const SearchResultsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px 5px',
  '&:focus': {
    outline: 'none',
  },
}))

const SearchResult = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #E5E5E5',
  py: '4px',
  [theme.breakpoints.down('md')]: {
    width: '70vw',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
}))
export default SearchDropdown
