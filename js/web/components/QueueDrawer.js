import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import QueueList from './QueueList'

const QueueDrawer = (props) => {
  const { track, playlist, activeIndexRef } = useContext(Audio.Context)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [nextInfo, setNextInfo] = useState()

  useEffect(() => {
    if (playlist.length > 0) {
      let index = activeIndexRef.current
      if (index === undefined) {
        setNextInfo(playlist[1])
      } else {
        setNextInfo(playlist[index + 1])
      }
    }
  }, [track, playlist, activeIndexRef.current])

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
    const playlistEntry = playlist.find(
      (entry) => entry.releasePubkey === track?.releasePubkey
    )

    if (playlistEntry) {
      setSelectedIndex(playlist?.indexOf(playlistEntry) || 0)
    }
  }, [track, playlist])

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
