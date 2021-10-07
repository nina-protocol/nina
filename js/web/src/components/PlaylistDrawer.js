import React, { useState, useEffect, useContext } from 'react'
import ninaCommon from 'nina-common'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import RootRef from '@material-ui/core/RootRef'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded'
import PauseRoundedIcon from '@material-ui/icons/PauseRounded'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import { useWallet } from '@solana/wallet-adapter-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const useStyles = makeStyles({
  list: {
    width: 300,
  },
  fullList: {
    width: 'auto',
  },
})

export default function PlaylistDrawer(props) {
  const { isPlaying, togglePlay } = props
  const classes = useStyles()
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
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
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
              <RootRef rootRef={provided.innerRef}>
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
              </RootRef>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )

  return (
    <div className="playlist__wrapper">
      {['left'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button variant="outlined" onClick={toggleDrawer(anchor, true)}>
            <QueueMusicIcon
              className="player__playlist-toggle"
              style={{ fill: `${theme.vars.purple}` }}
            />{' '}
            {playlist?.length > 0 ? `(${playlist.length})` : null}
          </Button>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  )
}
