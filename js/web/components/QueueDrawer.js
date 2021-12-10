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
import { useWallet } from '@solana/wallet-adapter-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Typography from '@mui/material/Typography'
import QueueList from './QueueList'

const { AudioPlayerContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const QueueDrawer = (props) => {
  const theme = useTheme()
  const { txid, updateTxid, playlist, reorderPlaylist, currentIndex } =
    useContext(AudioPlayerContext)
  const wallet = useWallet()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [nextInfo, setNextInfo] = useState()

  useEffect(() => {
    if (playlist.length > 0) {
      let index = currentIndex()
      if (index === undefined) {
        setNextInfo(playlist[1])
      } else {
        setNextInfo(playlist[index + 1])
      }
    }
  }, [txid, playlist])

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
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
        <Button
          onClick={toggleDrawer(!drawerOpen)}
          sx={{ textTransform: 'none !important' }}
        >
          <Typography variant="subtitle1">
            {!drawerOpen &&
              (nextInfo ? (
                <>
                  Next: {nextInfo.artist + ', '}
                  <Title> {nextInfo.title}</Title>
                </>
              ) : (
                'Open queue'
              ))}
            {drawerOpen && 'Close'}
          </Typography>
        </Button>
        <Drawer
          anchor={'bottom'}
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={quePaperStyle}
          ModalProps={queModalStyle}
        >
          <QueueList setDrawerOpen={setDrawerOpen} />
        </Drawer>
      </React.Fragment>
    </ToggleWrapper>
  )
}

const quePaperStyle = {
  sx: {
    height: '90%',
  },
}

const queModalStyle = {
  sx: {
    zIndex: '99',
  },
}

const Title = styled('span')(() => ({
  fontStyle: 'italic',
}))

const ToggleWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '0',
  '& button': {
    color: '#000000 !important',
    paddingRight: theme.spacing(2),

    '&:hover': {
      backgroundColor: `${theme.palette.transparent} !important`,
    },
    '& h6': {
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}))

export default React.memo(QueueDrawer)
