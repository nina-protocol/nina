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
import QueList from './QueList'

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

  return (
    <ToggleWrapper>
      <React.Fragment key={'left'}>
        <Button variant="outlined" onClick={toggleDrawer(!drawerOpen)}>
          <QueueMusicIcon
            style={{ fill: `${theme.palette.purple}` }}
          />{' '}

          {!drawerOpen && 
            (nextInfo ? `Up next: ${nextInfo.artist} - ${nextInfo.title}` : 'open que')
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
          <QueList isPlaying={isPlaying} togglePlay={togglePlay} setDrawerOpen={setDrawerOpen} />
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
    height: '90%'
  }
}

const queModalStyle = {
  sx: {
    zIndex: '99'
  }
}


const ToggleWrapper = styled(Box)(() => ({
  position: 'absolute',
  right: '0',
}))

export default QueDrawer
