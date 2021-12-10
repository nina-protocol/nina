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

const QueueList = (props) => {
  const { setDrawerOpen } = props
  const wallet = useWallet()
  const history = useHistory()
  const {
    txid,
    updateTxid,
    playlist,
    reorderPlaylist,
    removeTrackFromQueue,
    isPlaying,
    setIsPlaying,
  } = useContext(AudioPlayerContext)
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
    updateTxid(txid, playlist[index].releasePubkey, true)
  }

  const goToRelease = (e, releasePubkey) => {
    setDrawerOpen(false)
    history.push(`/${releasePubkey}`)
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
    // setPlaylistState(newPlaylist)

    // change context playlist state - skip updating local state
    // setSkipForReorder(true)
    reorderPlaylist(newPlaylist)
  }

  return (
    <>
      {playlist?.length === 0 && (
        <Box sx={{ margin: 'auto' }}>
          <div style={{ padding: '16px' }}>
            <Typography align="center">
              {wallet?.connected
                ? `You don't have any songs queued`
                : `Connect your wallet to load your collection`}
            </Typography>
          </div>
        </Box>
      )}

      <StyledQueueList>
        {playlist?.length > 0 && (
          <TableContainer
            style={{ overflowX: 'none' }}
            component={Paper}
            elevation={0}
          >
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
              <TableBody
                component={DroppableComponent(onDragEnd)}
                style={{ overflowX: 'none' }}
              >
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
                        <PauseRoundedIcon onClick={() => setIsPlaying(false)} />
                      ) : (
                        <PlayArrowRoundedIcon
                          onClick={() =>
                            selectedIndex === i
                              ? setIsPlaying(true)
                              : updateTxid(
                                  entry.txid,
                                  entry.releasePubkey,
                                  true
                                )
                          }
                        />
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
                        onClick={() =>
                          removeTrackFromQueue(entry.releasePubkey)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledQueueList>
    </>
  )
}

const DraggableComponent = (id, index) => (props) => {
  const { children } = props
  return (
    <Draggable key={id} draggableId={id} index={index}>
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
        <Droppable droppableId="droppable" direction="vertical">
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

const StyledQueueList = styled(Box)(({ theme }) => ({
  width: '700px',
  margin: ' 140px auto',
  overflowY: 'scroll',
  // paddingTop: '140px',
  [theme.breakpoints.down('md')]: {
    width: '80vw',
    paddingTop: '0',
  },
  '& .MuiTableCell-head': {
    ...theme.helpers.baseFont,
    fontWeight: '700',
  },
  '& .MuiTableCell-root': {
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      padding: '16px 0',
    },
  },
}))

export default QueueList
