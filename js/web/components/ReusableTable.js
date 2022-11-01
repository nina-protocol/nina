import React from "react";
import { useState, useEffect, useContext, createElement, Fragment } from 'react'
import "react-virtualized/styles.css";
import _ from "lodash";
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
// import Table from '@mui/material/Table'
// import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
// import TableRow from '@mui/material/TableRow'
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
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
import { useRouter } from 'next/router'
import "react-virtualized/styles.css";
import { Column, Table, SortDirection, AutoSizer } from "react-virtualized";
const { getImageFromCDN, loader } = imageManager



// Table data as a array of objects


const ReusableTable = ({ 
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

console.log('tableType :>> ', tableType);

//Header Setup
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

 //Data Setup
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
      formattedData = {
        id: data?.publicKey,
        link: `/profiles/${data?.publicKey}`,
        searchResultArtist: data.name,
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

  function rowRenderer({key, index, style}) {
    console.log("ROW RENDERER", key, index, style);

  return (
    <div key={key} style={style}>
      {/* {rows[index]} */}
      {index}
    </div>
  );
}

const cellRenderer = ({cellData, rowIndex, dataKey, rowData}) => {
  console.log('cellData :>> ', cellData);
  console.log('dataKey :>> ', dataKey);
  console.log('index :>> ', rowIndex);
  console.log('rowDat :>> ', rowData);
  const exclude = ['id', 'link', 'ctas', 'collect']

  switch (dataKey) {
    case 'ctas':
      return (
        <StyledTableCellButtonsContainer align="left" key={rowIndex}>
          <Button
            sx={{ cursor: 'pointer' }}
            id={cellData.releasePubkey}
            onClickCapture={(e) => handleQueue(e, cellData.releasePubkey, rowData.title)}
          >
            <ControlPointIcon sx={{ color: 'black' }} />
          </Button>
          <Button
            sx={{
              cursor: 'pointer',
            }}
            onClickCapture={(e) => handlePlay(e, cellData.releasePubkey)}
            id={cellData.releasePubkey}
          >
            {isPlaying && track?.releasePubkey === cellData.releasePubkey ? (
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
    case 'image':
    return (
        <StyledImageTableCell align="left" >
              <Box sx={{ width: '50px', textAlign: 'left', pr: '15px' }}>
                {cellData.includes('https') ? (
                  <Image
                    height={50}
                    width={50}
                    layout="responsive"
                    src={getImageFromCDN(
                      cellData,
                      100,
                      Date.parse(rowData.date)
                    )}
                    alt={rowIndex}
                    loader={loader}
                  />
                ) : (
                  <img src={cellData} height={50} width={50} />
                )}
              </Box>
          </StyledImageTableCell>
       ) 
    default:
      if (!exclude.includes(dataKey)) {
        return (
        <StyledTableCell>
          {cellData}
        </StyledTableCell>
        )
      }
      break;
  }
  }


    return (
      <div style={{ height: 400 }}>
        <AutoSizer style={{overFlow: 'none'}}>
          {({ height, width }) => (
            <Table
              width={width}
              height={height}
              headerHeight={20}
              rowHeight={50}
              overscanRowCount={50}
              // sort={this._sort}
              // sortBy={this.state.sortBy}
              // sortDirection={this.state.sortDirection}
              rowCount={rows.length}
              rowGetter={({ index }) => {
                console.log('rows[index] :>> ', rows[index]);
                return rows[index]
              }}
              onRowClick={({ rowData }) => {
                console.log('rowData :>> ', rowData)
                router.push(rowData.link)
              }}

            >
              {headCells.map(({id, ...other}, index) => {
                const headCell = headCells[index];
                return (
                  <Column
                    key={index}
                    dataKey={headCell.id}
                    headerRenderer={() => headCell.label}
                    cellRenderer={(cellData) => cellRenderer(cellData, index)}
                  >
                    {headCell.label}
                  </Column>
                )
              })}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'left',
  height: '50px',
  [theme.breakpoints.down('md')]: {
    padding: '5px',
  },
}))

const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '100px',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  minWidth: '100px',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
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


export default ReusableTable;
