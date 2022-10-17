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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const FeedDrawer = () => {
  const wallet = useWallet()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [items, setItems] = useState(undefined)
  const [totalItems, setTotalItems] = useState(0)
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getFeedForUser } = useContext(Release.Context)

  useEffect(() => {
    if (wallet.connected) {
      handleGetFeedForUser(wallet.publicKey.toBase58())
    }
  }, [wallet.connected])


  const toggleDrawer = (open) => (event) => {
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

  const handleGetFeedForUser = async (publicKey, refresh=false) => {
    const feed = await getFeedForUser(publicKey, refresh ? 0 : items?.length || 0)
    console.log('feed :>> ', feed);
    if (feed){
      const updatedFeedItems = feed?.feedItems.filter(item => {
        return !item.type.includes('Post')
      })
      setTotalItems(feed.total)
      if (items && items.length > 0) {
        setItems(items.concat(updatedFeedItems))
      } else {
        setItems(updatedFeedItems)
      }
    }
  }

  return (
    <Box>
      <Box key={'right'} sx={{ float:'right'}}>
        <StyledMenuButton onClick={toggleDrawer(true)} sx={{top: '100px'}}>
          <ArrowBackIosNewIcon />
        </StyledMenuButton>
        <StyledDrawer
          anchor={'right'}
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          BackdropProps={{ invisible: true }}
          variant={'persistent'}
        >
          <Feed
            items={items}
            toggleDrawer={toggleDrawer}
            playFeed={playFeed}
            handleGetFeedForUser={handleGetFeedForUser}
          />
        </StyledDrawer>
      </Box>
    </Box>
  )
}

const StyledMenuButton = styled(Button)(({ theme }) => ({
  padding: '0px 10px 0px 0px !important',
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
    width: 450,
    // maxwidth: 436,
    overflowX: 'hidden',
    border: '1px solid black',
    borderRight: 'none',
    [theme.breakpoints.down('md')]: {
      width: '100vw',
    },
  },
}))


export default FeedDrawer
