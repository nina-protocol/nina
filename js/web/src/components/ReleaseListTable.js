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
import { Link } from 'react-router-dom'

const { AudioPlayerContext } = ninaCommon.contexts
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
    { id: 'addToQue', numeric: false, label: 'Add to que' },
    { id: 'artist', numeric: false, disablePadding: false, label: 'Artist' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
  ]

  if (tableType === 'userCollection') {
    headCells.push({ id: 'duration', numeric: false, label: 'Duration' })
  }

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

  headCells.push({ id: 'moreInfo', numeric: false, label: 'View Release' })

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold' }}
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
  const history = useHistory()
  const [order] = useState('asc')
  const { addTrackToQue } = useContext(AudioPlayerContext)
  const handleClick = (event, releasePubkey) => {
    history.push(`/release/` + releasePubkey)
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
      addToQue: (
        <Button
          onClick={() => {
            addTrackToQue(releasePubkey)
          }}
        >
          +
        </Button>
      ),
      artist: metadata.properties.artist,
      title: metadata.properties.title,
    }

    rowData['addToQue'] = (
      <Button
        onClick={() => {
          addTrackToQue(releasePubkey)
        }}
      >
        +
      </Button>
    )

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
          onClick={() => collectRoyaltyForRelease(recipient, releasePubkey)}
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
    rowData['moreInfo'] = (
      <Link to={`/release/${releasePubkey}`}>More Info</Link>
    )

    return rowData
  })
  rows.sort((a, b) => (a.artist < b.artist ? -1 : 1))

  return (
    <Root>
      <Paper>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
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
                  <TableRow hover tabIndex={-1} key={row.id}>
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
  )
}

const PREFIX = 'ReleaseListTable'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  table: `${PREFIX}-table`,
  releaseImage: `${PREFIX}-releaseImage`,
}

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  [`& .${classes.table}`]: {
    minWidth: 750,
    '& .MuiTableCell-root': {
      lineHeight: '13.8px',
      fontSize: '12px',
      padding: theme.spacing(1),
    },
  },

  [`& .${classes.releaseImage}`]: {
    width: '20px',
    cursor: 'pointer',
  },
}))

export default ReleaseListTable
