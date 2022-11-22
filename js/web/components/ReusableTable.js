import { useState, useEffect, useContext, createElement, Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { styled } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'

const { getImageFromCDN, loader } = imageManager

const ReusableTableHead = ({ tableType, inDashboard }) => {
  let headCells = []

  if (tableType === 'profilePublishedReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
    if (inDashboard) {
      headCells.push({ id: 'price', label: 'Price' })
      headCells.push({ id: 'remaining', label: 'Remaining' })
      headCells.push({ id: 'collected', label: 'Earnings' })
      headCells.push({ id: 'collect', label: 'Collect' })
    }
  }

  if (tableType === 'profileCollectionReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
  }

  if (tableType === 'profileHubs') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'name', label: 'Name' })
    headCells.push({ id: 'description', label: 'Description' })
    if (inDashboard) {
      headCells.push({ id: 'hubLink', label: '' })
      headCells.push({ id: 'hubDashboard', label: '' })
    }
  }

  if (tableType === 'hubReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
  }

  if (tableType === 'allSearchResults') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'name', label: '' })
  }

  if (tableType === 'searchResultArtists') {
    headCells.push({ id: 'name', label: 'Artists' })
  }

  if (tableType === 'searchResultReleases') {
    headCells.push({ id: 'ctas', label: 'Releases' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'title', label: '' })
  }

  if (tableType === 'searchResultHubs') {
    headCells.push({ id: 'image', label: 'Hubs' })
  }

  if (tableType === 'filteredSearchResultArtists') {
    headCells.push({ id: 'searchResultArtist', label: '' })
  }

  if (tableType === 'filteredSearchResultReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'searchResultRelease', label: '' })
  }
  if (tableType === 'filteredSearchResultHubs') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'searchResultHub', label: '' })
  }

  return (
    <TableHead>
      <TableRow>
        {headCells?.map((headCell, i) => (
          <StyledTableHeadCell key={headCell.id}>
            <Typography sx={{ fontWeight: 'bold' }}>
              {headCell.label}
            </Typography>
          </StyledTableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  )
}
const HubDescription = ({ description }) => {
  const [hubDescription, setHubDescription] = useState()
  useEffect(() => {
    if (description?.includes('<p>')) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(JSON.parse(description).replaceAll('<p><br></p>', '<br>'))
        .then((file) => {
          setHubDescription(file.result)
        })
    } else {
      setHubDescription(description)
    }
  }, [description])
  return (
    <StyledTableCell align="left">
      <StyledTableDescriptionContainer>
        <Typography noWrap>{hubDescription}</Typography>
      </StyledTableDescriptionContainer>
    </StyledTableCell>
  )
}

const ReusableTableBody = ({
  items,
  tableType,
  inDashboard,
  collectRoyaltyForRelease,
  refreshProfile,
  dashboardPublicKey,
  isActiveView,
}) => {
  const router = useRouter()
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
  } = useContext(Audio.Context)
  const { ninaClient, displayNameForAccount, displayImageForAccount } =
    useContext(Nina.Context)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, {
      persistent: 'true',
      variant: 'info',
    })
    setTimeout(() => closeSnackbar(snackbarMessage), 3000)
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleQueue = (e, releasePubkey, title) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }

  const handleCollect = async (e, recipient, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    const result = await collectRoyaltyForRelease(recipient, releasePubkey)
    if (result.success) {
      enqueueSnackbar(result.msg, {
        variant: 'success',
      })
      refreshProfile()
    } else {
      enqueueSnackbar('Error Collecting Revenue for Release', {
        variant: 'error',
      })
    }
  }

  let rows = items?.map((data) => {
    const { releasePubkey, publicKey } = data
    const playData = {
      releasePubkey,
    }
    let formattedData = {}
    if (
      tableType === 'profilePublishedReleases' ||
      tableType === 'profileCollectionReleases'
    ) {
      formattedData = {
        ctas: playData,
        id: releasePubkey,
        link: `/${releasePubkey}`,
        image: data?.metadata?.image,
        date: data?.metadata?.properties?.date,
        artist: data?.metadata?.properties?.artist,
        title: data?.metadata?.properties?.title,
      }
      if (inDashboard) {
        const recipient = data.tokenData.revenueShareRecipients.find(
          (recipient) => recipient.recipientAuthority === dashboardPublicKey
        )
        const collectable = recipient.owed > 0
        const collectableAmount = ninaClient.nativeToUiString(
          recipient.owed,
          data.tokenData.paymentMint
        )

        const collectButton = (
          <StyledCollectButton
            disabled={!collectable}
            onClick={(e) => handleCollect(e, recipient, releasePubkey)}
            className={collectable ? 'collectable' : ''}
          >
            Collect
            {collectable && <span>{collectableAmount}</span>}
          </StyledCollectButton>
        )
        formattedData.price = ninaClient.nativeToUiString(
          data.tokenData.price,
          data.tokenData.paymentMint
        )
        formattedData.remaining = `${data.tokenData.remainingSupply} / ${data.tokenData.totalSupply}`
        formattedData.collected = ninaClient.nativeToUiString(
          recipient.collected + recipient.owed,
          data.tokenData.paymentMint
        )
        formattedData.collect = collectButton
      }
      formattedData.authorityPublicKey = data.tokenData.authority
    } else if (tableType === 'profileHubs') {
      formattedData = {
        id: releasePubkey,
        link: `/hubs/${data.handle}`,
        date: data?.createdAt,
        image: data?.data.image,
        hubName: data?.data.displayName,
        description: data?.data.description,
      }
      if (inDashboard) {
        ;(formattedData.hubDashboard = `${process.env.NINA_HUBS_URL}/${data.handle}/dashboard`),
          (formattedData.hubExternal = `${process.env.NINA_HUBS_URL}/${data.handle}`)
      }
    } else if (tableType === 'hubReleases') {
      formattedData = {
        ctas: playData,
        ...formattedData,
        id: data?.releasePubkey,
        image: data?.image,
        artist: data?.properties.artist,
        title: data?.properties.title,
        link: `/${data?.releasePubkey}`,
        date: data?.metadata?.properties?.date,
        authorityPublicKey: data?.authority,
      }
    } else if (tableType === 'hubCollaborators') {
      formattedData = {
        link: `/profiles/${data.collaborator}`,
        image: displayImageForAccount(data.collaborator),
        collaborator: displayNameForAccount(data.collaborator),
      }
    } else if (
      tableType === 'searchResultArtists' ||
      tableType === 'filteredSearchResultArtists'
    ) {
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
      formattedData = {
        id: data?.publicKey,
        link: `/profiles/${data?.account.publicKey}`,
        searchResultArtist: artistName,
      }
    } else if (
      tableType === 'searchResultReleases' ||
      tableType === 'filteredSearchResultReleases'
    ) {
      formattedData = {
        id: data?.publicKey,
        image: data?.image,
        link: `/${data?.publicKey}`,
        searchResultRelease: `${data?.artist} - ${data.title}`,
      }
    } else if (
      tableType === 'searchResultHubs' ||
      tableType === 'filteredSearchResultHubs'
    ) {
      formattedData = {
        id: data?.publicKey,
        image: data?.image,
        link: `/hubs/${data?.handle}`,
        searchResultHub: data.displayName,
      }
    } else if (tableType === 'followers') {
      formattedData = {
        link: `/profiles/${data.from.publicKey}`,
        image: displayImageForAccount(data.from.publicKey),
        profile: displayNameForAccount(data.from.publicKey),
      }
    } else if (tableType === 'following') {
      if (data.subscriptionType === 'hub') {
        formattedData = {
          link: `/hubs/${data.to.handle}`,
          image: data.to.data.image,
          hub: data.to.data.displayName,
        }
      } else if (data.subscriptionType === 'account') {
        formattedData = {
          link: `/profiles/${data.to.publicKey}`,
          image: displayImageForAccount(data.to.publicKey),
          profile: displayNameForAccount(data.to.publicKey),
        }
      }
    } else if (tableType === 'defaultSearchArtists') {
      formattedData = {
        id: data?.publicKey,
      }
    } else if (tableType === 'defaultSearchReleases') {
      formattedData = {
        id: data?.releasePubkey,
        image: data?.metadata.image,
        link: `/${data?.releasePubkey}`,
        searchResultRelease: `${data?.metadata.properties.artist} - ${data.metadata.properties.title}`,
      }
    } else if (tableType === 'defaultSearchHubs') {
      formattedData = {
        id: data?.publicKey,
        image: data?.data.image,
        link: `/hubs/${data?.handle}`,
        searchResultHub: data?.data.displayName,
      }
    }
    return formattedData
  })

  return (
    <TableBody>
      {rows?.map((row, i) => (
        <TableRow
          key={i}
          hover
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(row.link)}
        >
          {Object.keys(row).map((cellName, i) => {
            const cellData = row[cellName]
            if (
              cellName !== 'id' &&
              cellName !== 'date' &&
              cellName !== 'link' &&
              cellName !== 'authorityPublicKey'
            ) {
              if (cellName === 'ctas') {
                return (
                  <StyledTableCellButtonsContainer align="left" key={i}>
                    <Button
                      sx={{ cursor: 'pointer' }}
                      id={row.id}
                      onClickCapture={(e) => handleQueue(e, row.id, row.title)}
                    >
                      <ControlPointIcon sx={{ color: 'black' }} />
                    </Button>
                    <Button
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClickCapture={(e) => handlePlay(e, row.id)}
                      id={row.id}
                    >
                      {isPlaying && track?.releasePubkey === row.id ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                        />
                      )}
                    </Button>
                  </StyledTableCellButtonsContainer>
                )
              } else if (cellName === 'image') {
                return (
                  <StyledImageTableCell align="left" key={cellName}>
                    <Box sx={{ width: '50px', textAlign: 'left', pr: '15px' }}>
                      {row.image.includes('https') ? (
                        <Image
                          height={50}
                          width={50}
                          layout="responsive"
                          src={getImageFromCDN(row.image, 100)}
                          alt={i}
                          loader={loader}
                        />
                      ) : (
                        <img src={row.image} height={50} width={50} />
                      )}
                    </Box>
                  </StyledImageTableCell>
                )
              } else if (cellName === 'description') {
                return (
                  <HubDescription
                    description={cellData || null}
                    key={cellName}
                  />
                )
              } else if (cellName === 'title') {
                return (
                  <StyledProfileTableCell key={cellName} type={'profile'}>
                    <OverflowContainer>
                      <Typography sx={{ textDecoration: 'underline' }} noWrap>
                        {cellData}
                      </Typography>
                    </OverflowContainer>
                  </StyledProfileTableCell>
                )
              } else if (cellName === 'artist') {
                return (
                  <StyledProfileTableCell key={cellName} type={'profile'}>
                    <OverflowContainer overflowWidth={'20vw'}>
                      <Typography
                        noWrap
                        sx={{ hover: 'pointer' }}
                        onClickCapture={() => {
                          router.push(`/profiles/${row?.authorityPublicKey}`)
                        }}
                      >
                        <a>{cellData}</a>
                      </Typography>
                    </OverflowContainer>
                  </StyledProfileTableCell>
                )
              } else if (cellName === 'searchResultArtist') {
                return (
                  <SearchResultTableCell key={cellName}>
                    <SearchResultOverflowContainer>
                      <Typography
                        noWrap
                        onClickCapture={() => router.push(row?.link)}
                      >
                        <a>{cellData}</a>
                      </Typography>
                    </SearchResultOverflowContainer>
                  </SearchResultTableCell>
                )
              } else if (cellName === 'searchResultRelease') {
                return (
                  <SearchResultTableCell key={cellName}>
                    <SearchResultOverflowContainer>
                      <SearchResultOverflowContainer>
                        <Typography
                          noWrap
                          onClickCapture={() => router.push(`/${row?.id}`)}
                        >
                          <a>{cellData}</a>
                        </Typography>
                      </SearchResultOverflowContainer>
                    </SearchResultOverflowContainer>
                  </SearchResultTableCell>
                )
              } else if (cellName === 'searchResultHub') {
                return (
                  <SearchResultTableCell key={cellName}>
                    <SearchResultOverflowContainer>
                      <Typography
                        noWrap
                        onClickCapture={() => router.push(`/hubs/${row?.id}`)}
                      >
                        <a>{cellData}</a>
                      </Typography>
                    </SearchResultOverflowContainer>
                  </SearchResultTableCell>
                )
              } else if (cellName === 'price' || cellName === 'remaining') {
                return (
                  <StyledTableCell key={cellName}>
                    <LineBreakContainer>
                      <Typography>{cellData}</Typography>
                    </LineBreakContainer>
                  </StyledTableCell>
                )
              } else if (cellName === 'collect') {
                return (
                  <StyledTableCell key={cellName}>
                    <CollectContainer>{cellData}</CollectContainer>
                  </StyledTableCell>
                )
              } else if (cellName === 'hubDashboard') {
                return (
                  <HubTableCell key={cellName}>
                    <CollectContainer>
                      <Link href={`${row?.hubDashboard}`} passHref>
                        <a target="_blank" rel="noreferrer">
                          VIEW HUB DASHBOARD
                        </a>
                      </Link>
                    </CollectContainer>
                  </HubTableCell>
                )
              } else if (cellName === 'hubExternal') {
                return (
                  <HubTableCell key={cellName}>
                    <CollectContainer>
                      <Link href={`${row?.hubExternal}`} passHref>
                        <a target="_blank" rel="noreferrer">
                          VIEW HUB
                        </a>
                      </Link>
                    </CollectContainer>
                  </HubTableCell>
                )
              } else {
                return (
                  <StyledTableCell key={cellName}>
                    <OverflowContainer>
                      <Typography noWrap>
                        <Link href={row.link} passHref>
                          <a>{cellData}</a>
                        </Link>
                      </Typography>
                    </OverflowContainer>
                  </StyledTableCell>
                )
              }
            }
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}

const ReusableTable = ({
  items,
  tableType,
  inDashboard,
  collectRoyaltyForRelease,
  refreshProfile,
  dashboardPublicKey,
  isActiveView,
  hasOverflow,
  minHeightOverride = false,
}) => {
  return (
    <ResponsiveContainer
      hasOverflow={hasOverflow}
      minHeightOverride={minHeightOverride}
    >
      <ResponsiveTableContainer inDashboard={inDashboard}>
        <Table>
          {items?.length > 0 && (
            <ReusableTableHead
              tableType={tableType}
              inDashboard={inDashboard}
            />
          )}
          <ReusableTableBody
            items={items}
            tableType={tableType}
            inDashboard={inDashboard}
            collectRoyaltyForRelease={collectRoyaltyForRelease}
            refreshProfile={refreshProfile}
            dashboardPublicKey={dashboardPublicKey}
            isActiveView={isActiveView}
          />
        </Table>
      </ResponsiveTableContainer>
    </ResponsiveContainer>
  )
}

const ResponsiveTableContainer = styled(Box)(({ theme, inDashboard }) => ({
  borderBottom: 'none',
  padding: '0px',
  [theme.breakpoints.down('md')]: {
    overflowY: 'unset',
    height: '100% !important',
    paddingLeft: '5px',
    paddingRight: 0,
    overflowX: inDashboard ? 'scroll' : '',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '10px',
  },
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 5px',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: 'bold',
  borderBottom: 'none',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
    paddingRight: '5px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '10px',
  },
}))

const StyledTableCell = styled(TableCell)(({ theme, type }) => ({
  padding: '5px 5px',
  textAlign: 'left',
  height: '50px',
  width: '61vw',
  [theme.breakpoints.down('md')]: {
    width: '30vw',
    paddingRight: '10px',
  },
}))
const StyledProfileTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 5px',
  textAlign: 'left',
  height: '50px',
  width: '26vw',
  [theme.breakpoints.down('md')]: {
    width: '30vw',
    paddingRight: '10px',
  },
}))
const HubTableCell = styled(TableCell)(({ theme }) => ({
  width: '8vw',
}))
const StyledImageTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'left',
  padding: '5px',
}))
const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '100px',
  textAlign: 'left',
  padding: '5px 0px',
  textAlign: 'left',
  minWidth: '100px',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
  },
}))
const SearchResultTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'left',
  height: '50px',
  [theme.breakpoints.down('md')]: {
    padding: '5px',
    width: '100vw',
    fontSize: '16px',
  },
}))
const OverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  maxWidth: '14vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: '10vw',
  },
}))

const CollectContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  maxWidth: '15vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
}))

const LineBreakContainer = styled(Box)(({ theme }) => ({
  '& p': {
    overflow: 'hidden',
    maxWidth: '100px',
    textAlign: 'left',
    whiteSpace: 'wrap',
    textOverflow: 'ellipsis',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
}))

const StyledTableDescriptionContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '20vw',
}))

const ResponsiveContainer = styled(Box)(
  ({ theme, hasOverflow, minHeightOverride }) => ({
    width: theme.maxWidth,
    // maxHeight: hasOverflow ? 'auto' : 'unset',
    // webkitOverflowScrolling: 'touch',
    // minHeight: minHeightOverride ? 'unset' : '46vh',
    // overflowY: hasOverflow ? 'auto' : 'auto',
    overflowX: 'hidden',
    ['&::-webkit-scrollbar']: {
      display: 'none',
    },
    [theme.breakpoints.down('md')]: {
      width: '100vw',
      maxHeight: 'unset',
      overflowY: 'unset',
    },
  })
)

const SearchResultOverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  width: '70vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    width: '80vw',
  },
}))
const StyledCollectButton = styled(Button)(({ theme }) => ({
  color: `${theme.palette.blue} !important`,
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  ...theme.helpers.baseFont,
  '&.Mui-disabled': {
    color: `${theme.palette.grey.primary} !important`,
  },
  '& span': {
    color: `${theme.palette.grey.primary}`,
    fontSize: '10px',
  },
}))

export default ReusableTable
