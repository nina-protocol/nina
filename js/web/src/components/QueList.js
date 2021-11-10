import React, {useEffect, useState, useContext} from "react"
import {TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper} from '@material-ui/core'
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd"
import ninaCommon from 'nina-common'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import {Link} from 'react-router-dom'

const {AudioPlayerContext} = ninaCommon.contexts
const {NinaClient} = ninaCommon.utils

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: "rgb(235,235,235)"
  })
})


const QueList = (props) => {
  const {isPlaying, togglePlay} = props

  const {txid, updateTxid, playlist, reorderPlaylist} =
    useContext(AudioPlayerContext)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [playlistState, setPlaylistState] = useState(undefined)
  const [skipForReorder, setSkipForReorder] = useState(false)

  useEffect(() => {
    console.log('playlist :>> ', playlist);
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Play</TableCell>
            <TableCell>Play</TableCell>
            <TableCell>Artist</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>More Info</TableCell>
            <TableCell>Remove</TableCell>
          </TableRow>
        </TableHead>
        <TableBody component={DroppableComponent(onDragEnd)}>
          {playlist.map((entry, i) => (
            <TableRow component={DraggableComponent(entry.txid, i)} key={entry.id}  >
              <TableCell scope="row">{i + 1}</TableCell>
              <TableCell onClick={(event) =>
                handleListItemClick(event, i, entry.txid)
              }>
                {isPlaying && selectedIndex === i ? (
                  <PauseRoundedIcon
                    onClick={() => togglePlay()}
                  />
                ) : (
                  <PlayArrowRoundedIcon
                    onClick={() => togglePlay()}
                  />
                )}
              </TableCell>
              <TableCell>{entry.artist}</TableCell>
              <TableCell>{entry.title}</TableCell>
              <TableCell>
                <Link to={`/release/${entry.releasePubkey}`}>
                  More Info
                </Link>
              </TableCell>
              <TableCell>
                <Link to={`/release/${entry.releasePubkey}`}>
                  x
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const DraggableComponent = (id, index) => (props) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}

          {...props}
        >
          {props.children}
        </TableRow>
      )}
    </Draggable>
  )
}

const DroppableComponent = (
  onDragEnd: (result, provided) => void) => (props) => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'1'} direction="vertical">
          {(provided) => {
            return (
              <TableBody ref={provided.innerRef} {...provided.droppableProps} {...props}>
                {props.children}
                {provided.placeholder}
              </TableBody>
            )
          }}
        </Droppable>
      </DragDropContext>
    )
  }


  export default QueList;
