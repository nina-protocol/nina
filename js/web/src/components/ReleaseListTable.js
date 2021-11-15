import React, {useState, useContext} from 'react'
import {styled} from '@mui/material/styles'
import ninaCommon from 'nina-common'
import {useHistory} from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import {visuallyHidden} from '@mui/utils';
import Box from '@mui/material/Box';

const {AudioPlayerContext, ReleaseContext} = ninaCommon.contexts
const {NinaClient} = ninaCommon.utils
const ARWEAVE_GATEWAY_ENDPOINT = NinaClient.endpoints.arweave

const descendingComparator = (a, b, orderBy) => {
  switch (orderBy) {
    case 'artist':
    case 'title':
      a = a[orderBy].toLowerCase()
      b = b[orderBy].toLowerCase()
      break
    case 'edition':
    case 'sold':
    case 'date':

      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
      break

    case 'collect':
      a = parseFloat(a[orderBy].props.children.replace(/[^\d.-]/g, ''))
      b = parseFloat(b[orderBy].props.children.replace(/[^\d.-]/g, ''))
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
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0

}

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const EnhancedTableHead = (props) => {
  const {order, orderBy, tableType, onRequestSort} =
    props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  let headCells = [
    {
      id: 'art',
      numeric: false,
      disablePadding: true,
      label: '',
      renderCell: (params) => {
        return (
          <img
            src={`${ARWEAVE_GATEWAY_ENDPOINT}/${params.value.txId}`}
            alt="cover"
          />
        )
      },
    },
    {id: 'artist', numeric: false, disablePadding: false, label: 'Artist'},
    {id: 'title', numeric: false, disablePadding: false, label: 'Title'},
  ]

  if (tableType === 'userCollection') {
    headCells.push({id: 'duration', numeric: true, label: 'Duration'})
  }

  if (tableType === 'userPublished') {
    headCells.push({id: 'price', numeric: true, label: 'Price'})
    headCells.push({id: 'edition', numeric: true, label: 'Edition'})
    headCells.push({id: 'sold', numeric: true, label: 'Sold'})
    headCells.push({id: 'share', numeric: false, label: 'Share'})
    headCells.push({id: 'collected', numeric: true, label: 'Earnings'})
    headCells.push({id: 'collect', numeric: false, label: 'Collect'})
    headCells.push({id: 'date', numeric: false, label: 'Release Date'})
  }

  if (tableType === 'userRoyalty') {
    headCells.push({id: 'share', numeric: false, label: 'Share'})
    headCells.push({id: 'collected', numeric: false, label: 'Earnings'})
    headCells.push({id: 'collect', numeric: false, label: 'Collect'})
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
            sx={{fontWeight: 'bold', borderBottom: 'none'}}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              disabled={headCell.id === 'art'}
              sx={{'& svg': {fontSize: '14px '}}}
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
  const {releases, tableType, collectRoyaltyForRelease} = props
  const {updateTxid} = useContext(AudioPlayerContext)
  const {releaseState} = useContext(ReleaseContext)

  const history = useHistory()
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('artist')

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (e, releasePubkey) => {
    history.push(
      tableType === 'userCollection'
        ? `/collection/${releasePubkey}`
        : `/releases/${releasePubkey}`
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
      art: linkData,
      artist: metadata.properties.artist,
      title: metadata.properties.title,
    }

    if (tableType === 'userCollection') {
      const duration = NinaClient.formatDuration(
        metadata.properties.files[0].duration
      )
      rowData['duration'] = duration
    }

    if (tableType === 'userPublished') {
      const recipient = release.recipient
      const collectButton = (
        <Button
          variant="contained"
          color="primary"
          disabled={recipient.owed.toNumber() === 0}
          onClick={(e) => handleCollect(e, recipient, releasePubkey)}
          sx={{padding: '0px !important'}}
        >
          {NinaClient.nativeToUiString(
            recipient.owed.toNumber(),
            tokenData.paymentMint
          )}
        </Button>
      )

      rowData['price'] = `${NinaClient.nativeToUiString(
        tokenData.price.toNumber(),
        tokenData.paymentMint
      )}`
      rowData['edition'] = tokenData.totalSupply.toNumber()
      rowData['sold'] = tokenData.saleCounter.toNumber()
      rowData['share'] = `${recipient.percentShare.toNumber() / 10000}%`
      rowData['collected'] = `${NinaClient.nativeToUiString(
        recipient.collected.toNumber(),
        tokenData.paymentMint
      )}`
      rowData['collect'] = collectButton
      rowData['date'] = `${new Date(tokenData.releaseDatetime.toNumber() * 1000)
          .toISOString()
          .split('T')[0]
        }`
    }
    return rowData
  })
  rows.sort((a, b) => (a.artist < b.artist ? -1 : 1))

  return (
    <StyledPaper elevation={0} tableType={tableType}>
      <TableContainer>
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          aria-label="enhanced table"
          sx={{borderTop: 'none'}}
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
            {rows.slice().sort(getComparator(order, orderBy)).map((row) => {
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
                      if (cellName === 'art') {
                        return (
                          <TableCell
                            align="center"
                            component="th"
                            scope="row"
                            key={cellName}
                            onClick={(e) => handlePlay(e, row.id)}
                          >
                            <img
                              src={row.art.txId}
                              className={classes.releaseImage}
                              alt={'cover'}
                              key={cellName}
                            />
                          </TableCell>
                        )
                      } else if (cellName === 'title') {
                        return (
                          <TableCell align="center" key={cellName}>
                            <span style={{textDecoration: 'underline'}}>
                              {cellData}
                            </span>
                          </TableCell>
                        )
                      } else {
                        return (
                          <TableCell align="center" key={cellName}>
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
    </StyledPaper>
  )
}

const PREFIX = 'ReleaseListTable'

const classes = {
  table: `${PREFIX}-table`,
  releaseImage: `${PREFIX}-releaseImage`,
}

const StyledPaper = styled(Paper)(({theme, tableType}) => ({
  width: tableType === 'userPublished' ? '1120px' : '920px',
  margin: 'auto',
  [`& .${classes.table}`]: {
    minWidth: 750,
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


export default ReleaseListTable