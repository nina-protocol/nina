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
  }

  if (tableType === 'hubReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
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

const ReusableTableBody = ({ items, tableType, inDashboard, collectRoyaltyForRelease, refreshProfile }) => {
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

    const handleCollect = async (e, recipient, releasePubkey) => {
      e.stopPropagation()
      e.preventDefault()
      const result = await collectRoyaltyForRelease(recipient, releasePubkey)
      console.log('result :>> ', result);
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
    const {publicKey} = data
    const playData = {
      publicKey,
    }
    let formattedData = {}
    if (tableType === 'profilePublishedReleases' || tableType === 'profileCollectionReleases') {
      formattedData = {
        ctas: playData,
        id: publicKey,
        link: `/${publicKey}`,
        image: data?.metadata?.image,
        date: data?.metadata?.properties?.date,
        artist: data?.metadata?.properties?.artist,
        title: data?.metadata?.properties?.title,
      }
      if (inDashboard) {
        const collectButton = (
          <StyledCollectButton
            disabled={!data.collectable}
            onClick={(e) => handleCollect(e, data.recipient, publicKey)}
            className={data.collectable ? 'collectable' : ''}
          >
            Collect
            {data.collectable && (
              <span>
                {data.collectableAmount}
              </span>
            )}
          </StyledCollectButton>
        )
        formattedData.price = data.price
        formattedData.remaining = data.remaining
        formattedData.collected = data.collected
        formattedData.collect = collectButton     
      }
    }


    if (tableType === 'profileHubs') {
      formattedData = {
        id: publicKey,
        link: `/hubs/${data.handle}`,
        date: data?.createdAt,
        image: data?.data.image,
        artist: data?.data.displayName,
        description: data?.data.description,
      }
    }

    if (tableType === 'hubReleases') {
      formattedData = {
        ctas: playData,
        ...formattedData,
        id: data?.releasePubkey,
        image: data?.image,
        artist: data?.properties.artist,
        title: data?.properties.title,
        link: `/${data?.releasePubkey}`,
        date: data?.metadata?.properties?.date,
      }
    }

    if (tableType === 'hubCollaborators') {
      formattedData = {
        link: `/profiles/${data.collaborator}`,
        collaborator: truncateAddress(data.collaborator),
      }
    }

    if (tableType === 'followers') {
      formattedData = {
        link: `/profiles/${data.from}`,
        profile: truncateAddress(data.from),
      }
    }

    if (tableType === 'following') {
      formattedData = {
        link: `/profiles/${data.to}`,
        profile: truncateAddress(data.to),
      }
    }
    return formattedData
  })

  return (
    <TableBody>
      {rows?.map((row, i) => (
        <Link href={row.link} passHref>
          <TableRow key={i} hover sx={{ cursor: 'pointer' }}>
            {Object.keys(row).map((cellName, i) => {
              const cellData = row[cellName]
              if (
                cellName !== 'id' &&
                cellName !== 'date' &&
                cellName !== 'link'
              ) {
                if (cellName === 'ctas') {
                  return (
                    <StyledTableCellButtonsContainer align="left"  key={i}>
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
                        {isPlaying && track.id === row.id ? (
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
                      <Box sx={{width:'50px',  textAlign: 'left', pr: '15px' }}>
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
                        <Typography sx={{paddingLeft: '5px'}} noWrap>{cellData}</Typography>
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

const ReusableTable = ({ items, tableType, inDashboard, collectRoyaltyForRelease, refreshProfile }) => {
  return (
    <ResponsiveContainer>
      <ResponsiveTableContainer>
        <Table>
          <ReusableTableHead tableType={tableType} inDashboard={inDashboard} />
          <ReusableTableBody items={items} tableType={tableType} inDashboard={inDashboard} collectRoyaltyForRelease={collectRoyaltyForRelease} refreshProfile={refreshProfile} />
        </Table>
      </ResponsiveTableContainer>
    </ResponsiveContainer>
  )
}

const ResponsiveTableContainer = styled(Box)(({ theme }) => ({
  // width: '100vw',
  borderBottom: 'none',
  padding: '0px',
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    overflowY: 'unset',
    height: '100% !important',
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: '200px',
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
  // minWidth: '10vw',
  maxWidth: '15vw',
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
 [ '&::-webkit-scrollbar']: {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    maxHeight: 'unset',
    overflowY: 'unset',
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
