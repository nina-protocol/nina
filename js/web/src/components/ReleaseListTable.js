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
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'

const { AudioPlayerContext, ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils
const ARWEAVE_GATEWAY_ENDPOINT = NinaClient.endpoints.arweave

const EnhancedTableHead = (props) => {
  const { order, orderBy, tableType } = props

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
    { id: 'artist', numeric: false, disablePadding: false, label: 'Artist' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  ]

  if (tableType === 'userCollection') {
    headCells.push({ id: 'duration', numeric: false, label: 'Duration' })
  }

  if (tableType === 'userPublished') {
    headCells.push({ id: 'price', numeric: true, label: 'Price' })
    headCells.push({ id: 'edition', numeric: false, label: 'Edition' })
    headCells.push({ id: 'sold', numeric: false, label: 'Sold' })
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'earnings', numeric: false, label: 'Earnings' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
    headCells.push({ id: 'date', numeric: false, label: 'Release Date' })
  }

  if (tableType === 'userRoyalty') {
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'earnings', numeric: false, label: 'Earnings' })
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
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const ReleaseListTable = (props) => {
  const { releases, tableType, collectRoyaltyForRelease } = props
  const { updateTxid } = useContext(AudioPlayerContext)
  const { releaseState } = useContext(ReleaseContext)

  const history = useHistory()
  const [order] = useState('asc')

  const handleClick = (e, releasePubkey) => {
    history.push(tableType === 'userCollection' ? `/collection/${releasePubkey}` : `/releases/${releasePubkey}`)
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    updateTxid(releaseState.metadata[releasePubkey].properties.files[0].uri, releasePubkey)
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
          sx={{ padding: '0px !important' }}
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
      rowData[
        'edition'
      ] = tokenData.totalSupply.toNumber()
      rowData[
        'sold'
      ] = tokenData.saleCounter.toNumber()
      rowData['share'] = `${recipient.percentShare.toNumber() / 10000}%`
      rowData['collected'] = `${NinaClient.nativeToUiString(
        recipient.collected.toNumber(),
        tokenData.paymentMint
      )}`
      rowData['collect'] = collectButton
      rowData[
        'date'
      ] = `${new Date(tokenData.releaseDatetime.toNumber() * 1000).toISOString().split('T')[0]}`

    }
    return rowData
  })
  rows.sort((a, b) => (a.artist < b.artist ? -1 : 1))

  return (
        <StyledPaper elevation={0}>
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
                rowCount={rows.length}
              />
              <TableBody>
                {rows.map((row) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={(e) => handleClick(e, row.id)}>
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
                                <span style={{textDecoration: 'underline'}}>{cellData}</span>
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '823px',
  margin: 'auto',
  [`& .${classes.table}`]: {
    minWidth: 750,
    '& .MuiTableCell-root': {
      lineHeight: '13.8px',
      fontSize: '15px',
      padding: theme.spacing(1),
    },
  },

  [`& .${classes.releaseImage}`]: {
    width: '67px',
    cursor: 'pointer',
  },
}))

export default ReleaseListTable
