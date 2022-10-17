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
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { styled } from '@mui/material'
import { useSnackbar } from 'notistack'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
const { getImageFromCDN, loader } = imageManager

const ReusableTableHead = ({ tableType }) => {
  let headCells = []

  if (tableType === 'profilePublishedReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
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
  }

  if (tableType === 'hubReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
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

  return (
    <TableHead>
      <TableRow>
        {headCells?.map((headCell, i) => (
          <StyledTableHeadCell
            key={headCell.id}
            sx={{ fontWeight: 'bold', borderBottom: 'none' }}
          >
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

const ReusableTableBody = ({ releases, tableType }) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
  } = useContext(Audio.Context)

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

  let rows = releases?.map((data) => {
    const metadata = data?.metadata
    const properties = data?.metadata?.properties
    const releasePubkey = data?.releasePubkey
    const json = data?.json
    const hubPubkey = data?.handle

    const playData = {
      releasePubkey,
    }

    let formattedData = {
      id: releasePubkey,
      link: `/${releasePubkey}`,
      image: metadata?.image,
      date: properties?.date,
      artist: properties?.artist,
      title: properties?.title,
    }

    if (tableType === 'profilePublishedReleases') {
      formattedData = {
        ctas: playData,
        ...formattedData,
      }
    }

    if (tableType === 'profileCollectionReleases') {
      formattedData = {
        ctas: playData,
        ...formattedData,
      }
    }

    if (tableType === 'profileHubs') {
      formattedData = {
        id: data?.handle,
        link: `/hubs/${hubPubkey}`,
        date: data?.createdAt,
        image: json?.image,
        artist: json?.displayName,
        description: json?.description,
      }
    }

    if (tableType === 'hubReleases') {
      formattedData = {
        ctas: playData,
        ...formattedData,
      }
      formattedData.image = data?.image
      formattedData.artist = data?.properties.artist
      formattedData.title = data?.properties.title
    }

    if (tableType === 'hubCollaborators') {
      formattedData = {
        link: `/profiles/${data.collaborator}`,
        collaborator: truncateAddress(data.collaborator),
      }
    }
    if (tableType === 'searchResultArtists') {
      formattedData = {
        link: `/profiles/${data?.publicKey}`,
        collaborator: data.name,
      }
    }

    if (tableType === 'searchResultReleases') {
      formattedData = {
        id: data?.publicKey,

        image: data?.image,
        link: `/${data?.publicKey}`,
        title: data.title,
      }
    }
    if (tableType === 'searchResultHubs') {
      formattedData = {
        id: data?.publicKey,
        image: data?.image,
        link: `/hubs/${data?.handle}`,
        artist: data.displayName,
      }
    }
    return formattedData
  })

  return (
    <TableBody>
      {rows?.map((row, i) => (
        <Link href={row.link} passHref>
          <TableRow key={row.id} hover sx={{ cursor: 'pointer' }}>
            {Object.keys(row).map((cellName) => {
              const cellData = row[cellName]

              if (
                cellName !== 'id' &&
                cellName !== 'date' &&
                cellName !== 'link'
              ) {
                if (cellName === 'ctas') {
                  return (
                    <StyledTableCellButtonsContainer
                      align="left"
                      key={cellName}
                    >
                      <Button
                        sx={{ cursor: 'pointer' }}
                        id={row.id}
                        onClickCapture={(e) =>
                          handleQueue(e, row.id, row.title)
                        }
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
                        {isPlaying && track.releasePubkey === row.id ? (
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
                      <Box
                        sx={{ width: '50px', textAlign: 'left', pr: '15px' }}
                      >
                        <Image
                          height={'100%'}
                          width={'100%'}
                          layout="responsive"
                          src={getImageFromCDN(
                            row.image,
                            400,
                            Date.parse(row.date)
                          )}
                          alt={i}
                          priority={true}
                          loader={loader}
                          unoptimized={true}
                        />
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
                    <StyledTableCell key={cellName}>
                      <OverflowContainer>
                        <Typography sx={{ textDecoration: 'underline' }} noWrap>
                          {cellData}
                        </Typography>
                      </OverflowContainer>
                    </StyledTableCell>
                  )
                } else {
                  return (
                    <StyledTableCell key={cellName}>
                      <OverflowContainer>
                        <Typography
                          sx={{ paddingLeft: '5px', width: '100vw' }}
                          noWrap
                        >
                          {cellData}
                        </Typography>
                      </OverflowContainer>
                    </StyledTableCell>
                  )
                }
              }
            })}
            <StyledTableCell />
          </TableRow>
        </Link>
      ))}
    </TableBody>
  )
}

const ReusableTable = ({ releases, tableType }) => {
  return (
    <ResponsiveContainer>
      <ResponsiveTableContainer>
        <Table>
          <ReusableTableHead tableType={tableType} />
          <ReusableTableBody releases={releases} tableType={tableType} />
        </Table>
      </ResponsiveTableContainer>
    </ResponsiveContainer>
  )
}

const ResponsiveTableContainer = styled(TableCell)(({ theme }) => ({
  width: '100vw',
  borderBottom: 'none',
  padding: '0px',

  [theme.breakpoints.down('md')]: {
    overflowY: 'unset',
    height: '100% !important',
    paddingLeft: 0,
    paddingRight: 0,
  },
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'left',
  cursor: 'pointer',
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'left',
  height: '50px',
  [theme.breakpoints.down('md')]: {
    padding: '5px',
  },
}))
const StyledImageTableCell = styled(TableCell)(({ theme }) => ({
  width: '50px',
  textAlign: 'left',
  padding: '5px 0',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))
const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '100px',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
  },
}))

const OverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  minWidth: '10vw',
  maxWidth: '20vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
  },
}))

const StyledTableDescriptionContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '20vw',
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
  maxHeight: '80vh',
  webkitOverflowScrolling: 'touch',
  overflowY: 'auto',
  overflowX: 'hidden',
  ['&::-webkit-scrollbar']: {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    maxHeight: 'unset',
    overflowY: 'unset',
  },
}))

export default ReusableTable
