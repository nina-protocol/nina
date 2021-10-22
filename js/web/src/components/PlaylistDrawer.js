/* eslint @typescript-eslint/no-unused-vars: 0 */
import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import clsx from 'clsx'
import { useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { useWallet } from '@solana/wallet-adapter-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const PlaylistDrawer = (props) => {
  const { isPlaying, togglePlay } = props

  const theme = useTheme()

  const { txid, updateTxid, playlist, reorderPlaylist } =
    useContext(AudioPlayerContext)
  const wallet = useWallet()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [state, setState] = useState({
    left: false,
  })
  const [playlistState, setPlaylistState] = useState(undefined)
  const [skipForReorder, setSkipForReorder] = useState(false)

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setState({ ...state, [anchor]: open })
  }

  useEffect(() => {
    if (!skipForReorder) {
      setPlaylistState(playlist)
    } else {
      setSkipForReorder(false)
    }
  }, [playlist])

  useEffect(() => {
    const playlistEntry = playlist.find((entry) => entry.txid === txid)

    if (playlistEntry) {
      setSelectedIndex(playlist?.indexOf(playlistEntry) || 0)
    }
  }, [txid, playlist])

  const handleListItemClick = (event, index, txid) => {
    setSelectedIndex(index)
    updateTxid(txid)
  }

  const getItemStyle = (isDragging, draggableStyle) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
      background: 'rgb(235,235,235)',
    }),
  })

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

  const list = (anchor) => (
    <Root
      className={classes.list}
      role="presentation"
    >
      {playlist?.length === 0 && (
        <div style={{ padding: '16px' }}>
          <p>
            {wallet?.connected
              ? `You don't have any songs`
              : `Connect your wallet to load your collection`}
          </p>
        </div>
      )}
      {playlist?.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <Box ref={provided.innerRef}>
                <List>
                  {playlist.map((entry, i) => {
                    const text = `${entry.artist}: ${entry.title}`
                    return (
                      <Draggable
                        key={entry.txid}
                        draggableId={entry.txid}
                        index={i}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            button
                            key={entry.txid}
                            onClick={(event) =>
                              handleListItemClick(event, i, entry.txid)
                            }
                            ContainerComponent="li"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            {...provided.placeholder}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {entry.txid === txid && (
                              <ListItemIcon>
                                {isPlaying && selectedIndex === i ? (
                                  <PauseRoundedIcon
                                    onClick={() => togglePlay()}
                                  />
                                ) : (
                                  <PlayArrowRoundedIcon
                                    onClick={() => togglePlay()}
                                  />
                                )}
                              </ListItemIcon>
                            )}
                            <ListItemText primary={text} />
                          </ListItem>
                        )}
                      </Draggable>
                    )
                  })}
                </List>
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Root>
  )

  return (
    <div className="playlist__wrapper">
        <React.Fragment key={'left'}>
          <Button variant="outlined" onClick={toggleDrawer('left', true)}>
            <QueueMusicIcon
              className="player__playlist-toggle"
              style={{ fill: `${theme.palette.purple}` }}
            />{' '}
            {playlist?.length > 0 ? `(${playlist.length})` : null}
          </Button>
          <Drawer
            anchor={'left'}
            open={state['left']}
            onClose={toggleDrawer('left', false)}
          >
            {list('left')}
          </Drawer>
        </React.Fragment>
    </div>
  )
}

const PREFIX = 'PlaylistDrawer'

const classes = {
  list: `${PREFIX}-list`,
  fullList: `${PREFIX}-fullList`,
}

const Root = styled('div')({
  [`&.${classes.list}`]: {
    width: 300,
  },
})

export default PlaylistDrawer

