import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import nina from "@nina-protocol/nina-sdk";
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useWallet } from '@solana/wallet-adapter-react'
import Typography from '@mui/material/Typography'
import QueueList from './QueueList'
const { AudioPlayerContext } = nina.contexts

const QueueDrawer = (props) => {
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
