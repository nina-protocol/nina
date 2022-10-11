import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Icon } from '@material-ui/core'
import Feed from './Feed'
import axios from 'axios'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'

const FeedDrawer = () => {
  const wallet = useWallet()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [items, setItems] = useState(undefined)
  const [totalItems, setTotalItems] = useState(0)
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getFeedForUser } = useContext(Release.Context)

  useEffect(() => {
    handleGetFeedForUser()
  }, [])


  const toggleDrawer = (open) => (event) => {
    console.log('event', event)
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
  }

  const playFeed = () => {
    const audioFeedItems = []
    items.forEach((item) => {
      if (item.release) {
        audioFeedItems.push(item.release.publicKey)
      }
    })
    resetQueueWithPlaylist(audioFeedItems)
  }

  const handleGetFeedForUser = async (refresh=false) => {
    const feed = await getFeedForUser('7g2euzpRxm2A9kgk4UJ9J5ntUYvodTw4s4m7sL1C8JE', refresh ? 0 : items?.length || 0)
    const updatedFeedItems = feed.feedItems
    setTotalItems(feed.total)
    if (items && items.length > 0) {
      setItems(items.concat(updatedFeedItems))
    } else {
      setItems(updatedFeedItems)
    }
  }

  return (
    <div>
      {
        <Box key={'right'} sx={{height: '70%', float:'right'}}>
          <StyledMenuButton onClick={toggleDrawer(true)} sx={{top: '100px'}}>
            <Icon>
              <img src={'/hamburger.svg'} height={25} width={25} />
            </Icon>
          </StyledMenuButton>
          <StyledDrawer
            anchor={'right'}
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            BackdropProps={{ invisible: true }}
          >
            <Feed
              items={items}
              toggleDrawer={toggleDrawer}
              playFeed={playFeed}
              handleGetFeedForUser={handleGetFeedForUser}
            />
          </StyledDrawer>
        </Box>
      }
    </div>
  )
}

const StyledMenuButton = styled(Button)(({ theme }) => ({
  padding: '0px !important',
  zIndex: '10',
  '&:hover': {
    backgroundColor: `${theme.palette.transparent} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.black,
  },
}))

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    top: '80px',

    height: '80%',
    width: 436,
    maxwidth: 436,
    overflowX: 'hidden',
    [theme.breakpoints.down('md')]: {
      width: '100vw',
    },
  },
}))


export default FeedDrawer
