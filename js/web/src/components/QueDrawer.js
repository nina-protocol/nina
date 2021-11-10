/* eslint @typescript-eslint/no-unused-vars: 0 */
import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import clsx from 'clsx'
import { useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { useWallet } from '@solana/wallet-adapter-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import {Typography} from '@material-ui/core'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const QueDrawer = (props) => {
  const { isPlaying, togglePlay, nextInfo } = props

  const theme = useTheme()

  const { txid, updateTxid, playlist, reorderPlaylist } =
    useContext(AudioPlayerContext)
  const wallet = useWallet()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [playlistState, setPlaylistState] = useState(undefined)
  const [skipForReorder, setSkipForReorder] = useState(false)

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerOpen( open )
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
    <Que role="presentation">
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
    </Que>
  )

  return (
    <ToggleWrapper>
      <React.Fragment key={'left'}>
        <Button variant="outlined" onClick={toggleDrawer(true)}>
          <QueueMusicIcon
            style={{ fill: `${theme.palette.purple}` }}
          />{' '}

          {!drawerOpen && 
           ( nextInfo ? `Up next: ${nextInfo.artist}` : 'open que')
          }

          {drawerOpen && 
            ('Close')
          }

        </Button>
        <Drawer
          anchor={'bottom'}
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={quePaperStyle}
          ModalProps={queModalStyle}
        >
          {list('bottom')}
        </Drawer>
      </React.Fragment>
    </ToggleWrapper>
  )
}

const PREFIX = 'PlaylistDrawer'

const classes = {
  list: `${PREFIX}-list`,
  fullList: `${PREFIX}-fullList`,
}

const quePaperStyle = {
  sx: {
    border: '2px solid blue',
    height: '90%'
  }
}

const queModalStyle = {
  sx: {
    zIndex: '99'
  }
}

const Que = styled('div')({
  border: '2px solid red',
  // height: '90%'
})

const ToggleWrapper = styled(Box)(() => ({
  position: 'absolute',
  right: '0',
}))

export default QueDrawer
