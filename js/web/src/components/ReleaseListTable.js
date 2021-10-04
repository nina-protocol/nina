import React, { useState } from 'react'
import ninaCommon from 'nina-common'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'

const { NinaClient } = ninaCommon.utils

const ARWEAVE_GATEWAY_ENDPOINT = NinaClient.endpoints.arweave

function EnhancedTableHead(props) {
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
            className={'releaseList__image'}
            src={`${ARWEAVE_GATEWAY_ENDPOINT}/${params.value.txId}`}
            alt="cover"
          />
        )
      },
    },
    { id: 'artist', numeric: false, disablePadding: false, label: 'Artist' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  ]

  if (tableType === 'userPublished') {
    headCells.push({ id: 'price', numeric: true, label: 'Price' })
    headCells.push({ id: 'available', numeric: false, label: 'Available' })
    headCells.push({ id: 'revenue', numeric: false, label: 'Revenue' })
  }

  if (tableType === 'userRoyalty') {
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'collected', numeric: false, label: 'Collected' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
  }

  return (
    <TableHead className="releases__table-head">
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  th: {
    border: '2px  solid red;',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}))

export default function ReleaseListTable(props) {
  const { releases, tableType } = props
  const history = useHistory()
  const classes = useStyles()
  const [order] = useState('asc')
  const [orderBy] = useState('calories')

  const handleClick = (event, releasePubkey) => {
    history.push(`/release/` + releasePubkey)
  }

  let rows = releases.map((release) => {
    const metadata = release.metadata
    const tokenData = release.tokenData
    const releasePubkey = release.releasePubkey

    const linkData = {
      releasePubkey,
      txId: metadata.image,
    }

    const rowData = {
      id: releasePubkey,
      art: linkData,
      artist: metadata.properties.artist,
      title: metadata.properties.title,
    }
    if (tableType === 'userPublished') {
      rowData['price'] = `${NinaClient.nativeToUiString(
        tokenData.price.toNumber(),
        tokenData.paymentMint
      )}`
      rowData[
        'available'
      ] = `${tokenData.remainingSupply.toNumber()} / ${tokenData.totalSupply.toNumber()}`
      rowData['revenue'] = `${NinaClient.nativeToUiString(
        tokenData.totalCollected.toNumber(),
        tokenData.paymentMint
      )}`
    }

    if (tableType === 'userRoyalty') {
      const recipient = release.recipient
      const collectRoyaltyForRelease = props.collectRoyaltyForRelease
      const collectButton = (
        <Button
          variant="contained"
          color="primary"
          disabled={recipient.owed.toNumber() === 0}
          onClick={() => collectRoyaltyForRelease(recipient, releasePubkey)}
        >
          {NinaClient.nativeToUiString(
            recipient.owed.toNumber(),
            tokenData.paymentMint
          )}
        </Button>
      )
      rowData['share'] = `${recipient.percentShare.toNumber() / 10000}%`
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
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer className="releases__table-container">
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              className={classes}
              order={order}
              orderBy={orderBy}
              tableType={tableType}
              rowCount={rows.length}
            />
            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow
                    hover
                    onClick={(event) =>
                      tableType === 'userRoyalty'
                        ? null
                        : handleClick(event, row.id)
                    }
                    className="releaseList__row"
                    tabIndex={-1}
                    key={row.id}
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
                              onClick={(event) => handleClick(event, row.id)}
                            >
                              <img
                                src={row.art.txId}
                                className="releaseList__image"
                                alt={'cover'}
                                key={cellName}
                              />
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
      </Paper>
    </div>
  )
}
