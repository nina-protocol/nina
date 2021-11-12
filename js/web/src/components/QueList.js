import React, { useEffect, useState, useContext } from 'react'
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ninaCommon from 'nina-common'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import { useHistory } from 'react-router-dom'
// import { Link } from 'react-router-dom'
import { Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import CloseIcon from '@mui/icons-material/Close'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: 'rgb(235,235,235)',
  }),
})

const QueList = (props) => {
  const { isPlaying, togglePlay, setDrawerOpen } = props
  const wallet = useWallet()
  const history = useHistory()
  const { txid, updateTxid, playlist, reorderPlaylist, removeTrackFromQueue } =
    useContext(AudioPlayerContext)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playlistState, setPlaylistState] = useState(undefined)
  const [skipForReorder, setSkipForReorder] = useState(false)

  useEffect(() => {
    const playlistEntry = playlist.find((entry) => entry.txid === txid)

    if (playlistEntry) {
      setSelectedIndex(playlist?.indexOf(playlistEntry) || 0)
    }
  }, [txid, playlist])

  useEffect(() => {
    if (!skipForReorder) {
      setPlaylistState(playlist)
    } else {
      setSkipForReorder(false)
    }
  }, [playlist])

  const handleListItemClick = (event, index, txid) => {
    setSelectedIndex(index)
    updateTxid(txid)
  }

  const goToRelease = (e, releasePubkey) => {
    setDrawerOpen(false)
    history.push(`/releases/` + releasePubkey)
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    // change local playlist state
    const newPlaylist = [...playlistState]
    NinaClient.arrayMove(
      newPlaylist,
      result.source.index,
      result.destination.index
    )

    const playlistEntry = playlistState.find((entry) => entry.txid === txid)

    if (playlistEntry) {
      setSelectedIndex(playlist?.indexOf(playlistEntry) || 0)
    }
    setPlaylistState(newPlaylist)

    // change context playlist state - skip updating local state
    setSkipForReorder(true)
    reorderPlaylist(result)
  }

  return (
    <StyledQueList>
      {playlist?.length === 0 && (
        <div style={{ padding: '16px' }}>
          <Typography align="center">
            {wallet?.connected
              ? `You don't have any songs`
              : `Connect your wallet to load your collection`}
          </Typography>
        </div>
      )}

      {playlist?.length > 0 && (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Play</TableCell>
                <TableCell>Artist</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>More Info</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody component={DroppableComponent(onDragEnd)}>
              {playlist.map((entry, i) => (
                <TableRow
                  component={DraggableComponent(entry.txid, i)}
                  key={entry.txid}
                >
                  <TableCell scope="row">{i + 1}</TableCell>
                  <TableCell
                    onClick={(event) =>
                      handleListItemClick(event, i, entry.txid)
                    }
                  >
                    {isPlaying && selectedIndex === i ? (
                      <PauseRoundedIcon onClick={() => togglePlay()} />
                    ) : (
                      <PlayArrowRoundedIcon onClick={() => togglePlay()} />
                    )}
                  </TableCell>
                  <TableCell>{entry.artist}</TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell
                    onClick={(e) => {
                      goToRelease(e, entry.releasePubkey)
                    }}
                  >
                    More Info
                  </TableCell>
                  <TableCell>
                    <CloseIcon
                      onClick={() => removeTrackFromQueue(entry.releasePubkey)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </StyledQueList>
  )
}

const DraggableComponent = (id, index) => (props) => {
  const { children } = props
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
          {...props}
        >
          {children}
        </TableRow>
      )}
    </Draggable>
  )
}

const DroppableComponent =
  (onDragEnd: (result, provided) => void) => (props) => {
    const { children } = props
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'1'} direction="vertical">
          {(provided) => {
            return (
              <TableBody
                ref={provided.innerRef}
                {...provided.droppableProps}
                {...props}
              >
                {children}
                {provided.placeholder}
              </TableBody>
            )
          }}
        </Droppable>
      </DragDropContext>
    )
  }

const StyledQueList = styled(Box)(({ theme }) => ({
  width: '700px',
  margin: 'auto',
  '& .MuiTableCell-head': {
    ...theme.helpers.baseFont,
    fontWeight: '700',
  },
  '& .MuiTableCell-root': {
    textAlign: 'center',
  },
}))

export default QueList
