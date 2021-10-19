import React, { useState } from 'react'
import { styled } from '@mui/material/styles';
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

const PREFIX = 'ReleaseListTable';

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  table: `${PREFIX}-table`,
  releaseImage: `${PREFIX}-releaseImage`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    width: '100%',
  },

  [`& .${classes.paper}`]: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },

  [`& .${classes.table}`]: {
    minWidth: 750,
  },

  [`& .${classes.releaseImage}`]: {
    width: '40px',
    cursor: 'pointer',
  }
}));

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

  if (tableType === 'userPublished') {
    headCells.push({ id: 'price', numeric: true, label: 'Price' })
    headCells.push({ id: 'available', numeric: false, label: 'Available' })
    headCells.push({ id: 'revenue', numeric: false, label: 'Revenue' })
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'collected', numeric: false, label: 'Collected' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
  }

  if (tableType === 'userRoyalty') {
    headCells.push({ id: 'share', numeric: false, label: 'Share' })
    headCells.push({ id: 'collected', numeric: false, label: 'Collected' })
    headCells.push({ id: 'collect', numeric: false, label: 'Collect' })
  }

  return (
    <TableHead>
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

const ReleaseListTable = (props) => {
  const { releases, tableType } = props
  const history = useHistory()

  const [order] = useState('asc')
  // const [orderBy] = useState('calories')

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
    <Root className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              className={classes}
              order={order}
              // orderBy={orderBy}
              tableType={tableType}
              rowCount={rows.length}
            />
            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow
                    hover
                    onClick={(event) =>
                      tableType === 'userPublished'
                        ? null
                        : handleClick(event, row.id)
                    }
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
                                className={classes.releaseImage}
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
    </Root>
  );
}

export default ReleaseListTable
