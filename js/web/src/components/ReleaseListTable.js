import React, { useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useHistory } from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { visuallyHidden } from '@mui/utils'
import Box from '@mui/material/Box'
import { Fade } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'

const { AudioPlayerContext, ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const descendingComparator = (a, b, orderBy) => {
  switch (orderBy) {
    case 'artist':
    case 'title':
      a = a[orderBy].toLowerCase()
      b = b[orderBy].toLowerCase()
      break

    case 'date':
      if (b[orderBy] < a[orderBy]) {
        return -1
      }
      if (b[orderBy] > a[orderBy]) {
        return 1
      }
      break

    case 'collect':
      a =
        parseFloat(
          a[orderBy].props.children[1]?.props?.children?.replace(/[^\d.-]/g, '')
        ) || 0
      b =
        parseFloat(
          b[orderBy].props.children[1]?.props?.children?.replace(/[^\d.-]/g, '')
        ) || 0
      break

    case 'remaining':
      a = parseFloat(a[orderBy].substring(0, a[orderBy].indexOf('/')))
      b = parseFloat(b[orderBy].substring(0, b[orderBy].indexOf('/')))

      break

    case 'price':
    case 'collected':
    case 'share':
    default:
      a = parseFloat(a[orderBy].replace(/[^\d.-]/g, ''))
      b = parseFloat(b[orderBy].replace(/[^\d.-]/g, ''))
      break
  }

  if (b < a) {
    return -1
  }
  if (b > a) {
    return 1
  }
  return 0
}

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

const EnhancedTableHead = (props) => {
  const { order, orderBy, tableType, onRequestSort } = props

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  let headCells = [
    {
      id: 'ctas',
      numeric: false,
      disablePadding: true,
      label: '',
    },
    { id: 'artist', numeric: false, disablePadding: false, label: 'Artist' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  ]

  if (tableType === 'userCollection') {
    headCells.push({ id: 'duration', numeric: true, label: 'Duration' })
  }

  if (tableType === 'allReleases') {
    headCells.push({ id: 'price', numeric: true, label: 'Price' })
    headCells.push({ id: 'remaining', numeric: true, label: 'Remaining' })
    headCells.push({ id: 'date', numeric: false, label: 'Release Date' })
  }

  if (tableType === 'userPublished') {
    headCells.push({ id: 'price', numeric: true, label: 'Price' })
    headCells.push({ id: 'remaining', numeric: true, label: 'Remaining' })
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'date', numeric: false, label: 'Release Date' })
    headCells.push({ id: 'collected', numeric: true, label: 'Earnings' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
  }

  if (tableType === 'userRoyalty') {
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'collected', numeric: false, label: 'Earnings' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold', borderBottom: 'none' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              disabled={headCell.id === 'ctas'}
              sx={{ '& svg': { fontSize: '14px ' } }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const ReleaseListTable = (props) => {
  const { releases, tableType, collectRoyaltyForRelease } = props
  const { updateTxid, addTrackToQueue } = useContext(AudioPlayerContext)
  const { releaseState } = useContext(ReleaseContext)

  const history = useHistory()
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('artist')

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleClick = (e, releasePubkey) => {
    history.push(
      tableType === 'userPublished'
        ? `/releases/${releasePubkey}`
        : `/${releasePubkey}`
    )
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    updateTxid(
      releaseState.metadata[releasePubkey].properties.files[0].uri,
      releasePubkey,
      true
    )
  }

  const handleAddTrackToQueue = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    addTrackToQueue(releasePubkey)
  }

  const handleCollect = (e, recipient, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    collectRoyaltyForRelease(recipient, releasePubkey)
  }

  let rows = releases.map((release) => {
    const metadata = release.metadata
    const tokenData = release.tokenData
    const releasePubkey = release.releasePubkey

    const linkData = {
      releasePubkey,
      txId: metadata?.image,
    }

    const rowData = {
      id: releasePubkey,
      ctas: linkData,
      artist: metadata.properties.artist,
      title: metadata.properties.title,
    }

    if (tableType === 'userCollection') {
      const duration = NinaClient.formatDuration(
        metadata.properties.files[0].duration
      )
      rowData['duration'] = duration
    }

    if (tableType === 'allReleases') {
      rowData['price'] = `${NinaClient.nativeToUiString(
        tokenData.price.toNumber(),
        tokenData.paymentMint
      )}`
      rowData[
        'remaining'
      ] = `${tokenData.remainingSupply.toNumber()} / ${tokenData.totalSupply.toNumber()} `
      rowData['date'] = `${
        new Date(tokenData.releaseDatetime.toNumber() * 1000)
          .toISOString()
          .split('T')[0]
      }`
    }

    if (tableType === 'userPublished') {
      const recipient = release.recipient
      const collectable = recipient.owed.toNumber() > 0
      const collectButton = (
        <StyledCollectButton
          disabled={!collectable}
          onClick={(e) => handleCollect(e, recipient, releasePubkey)}
          className={collectable ? 'collectable' : ''}
        >
          Collect
          {collectable && (
            <span>
              {NinaClient.nativeToUiString(
                recipient.owed.toNumber(),
                tokenData.paymentMint
              )}
            </span>
          )}
        </StyledCollectButton>
      )

      rowData['price'] = `${NinaClient.nativeToUiString(
        tokenData.price.toNumber(),
        tokenData.paymentMint
      )}`
      rowData[
        'remainind'
      ] = `${tokenData.remainingSupply.toNumber()} / ${tokenData.totalSupply.toNumber()} `
      rowData['share'] = `${recipient.percentShare.toNumber() / 10000}%`
      rowData['date'] = `${
        new Date(tokenData.releaseDatetime.toNumber() * 1000)
          .toISOString()
          .split('T')[0]
      }`
      rowData['collected'] = `${NinaClient.nativeToUiString(
        recipient.collected.toNumber(),
        tokenData.paymentMint
      )}`
      rowData['collect'] = collectButton
    }
    return rowData
  })
  rows.sort((a, b) => (a.artist < b.artist ? -1 : 1))

  return (
    <StyledPaper elevation={0} tableType={tableType}>
      <Fade in={rows.length > 0}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
            sx={{ borderTop: 'none' }}
          >
            <EnhancedTableHead
              className={classes}
              order={order}
              tableType={tableType}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {rows
                .slice()
                .sort(getComparator(order, orderBy))
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={(e) => handleClick(e, row.id)}
                    >
                      {Object.keys(row).map((cellName) => {
                        const cellData = row[cellName]
                        if (cellName !== 'id') {
                          if (cellName === 'ctas') {
                            return (
                              <TableCell
                                align="center"
                                component="th"
                                scope="row"
                                key={cellName}
                              >
                                <ControlPointIcon
                                  onClick={(e) =>
                                    handleAddTrackToQueue(e, row.id)
                                  }
                                  sx={{ color: 'black', marginRight: '15px' }}
                                />
                                <PlayCircleOutlineOutlinedIcon
                                  onClick={(e) => handlePlay(e, row.id)}
                                  sx={{ color: 'black' }}
                                />
                              </TableCell>
                            )
                          } else if (cellName === 'title') {
                            return (
                              <TableCell align="center" key={cellName}>
                                <span style={{ textDecoration: 'underline' }}>
                                  {cellData}
                                </span>
                              </TableCell>
                            )
                          } else {
                            return (
                              <TableCell
                                align="center"
                                size="small"
                                key={cellName}
                              >
                                {cellData}
                              </TableCell>
                            )
                          }
                        }
                        return null
                      })}
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
    </StyledPaper>
  )
}

const PREFIX = 'ReleaseListTable'

const classes = {
  table: `${PREFIX}-table`,
  releaseImage: `${PREFIX}-releaseImage`,
}

const StyledPaper = styled(Paper)(({ theme, tableType }) => ({
  width: tableType === 'userPublished' ? '1000px' : '800px',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    maxHeight: '80vh',
    overflow: 'scroll',
    width: '100%',
  },
  [`& .${classes.table}`]: {
    minWidth: 750,
    [theme.breakpoints.down('md')]: {
      width: '80vw',
      marginBottom: '100px',
    },
    '& .MuiTableCell-root': {
      ...theme.helpers.baseFont,
      padding: theme.spacing(1),
      textAlign: 'left',
      whiteSpace: 'nowrap',
      '& span': {
        textOverflow: 'ellipsis',
        maxWidth: '120px',
        overflow: 'hidden',
        display: 'table-cell',
      },
    },
  },

  [`& .${classes.releaseImage}`]: {
    width: '40px',
    cursor: 'pointer',
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

export default ReleaseListTable
