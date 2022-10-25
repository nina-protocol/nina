import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Icon } from '@material-ui/core'
import Feed from './Feed'
import Suggestions from './Suggestions'
import axios from 'axios'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'

const FeedDrawer = () => {
  const wallet = useWallet()
  const { userSubscriptions } = useContext(Nina.Context)

  const [drawerOpen, setDrawerOpen] = useState(true)
  const [feedItems, setFeedItems] = useState(undefined)
  const [hubSuggestions, setHubSuggestions] = useState(undefined)
  const [totalItems, setTotalItems] = useState(0)
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { getFeedForUser } = useContext(Release.Context)
  const [activeDrawerTypeIndex, setActiveDrawerTypeIndex] = useState(1)
  const drawerTypes = ['latest', 'suggestions']

  useEffect(() => {
    if (wallet.connected) {
      handleGetFeedForUser(wallet.publicKey.toBase58())
      getHubSuggestionsForUser(wallet.publicKey.toBase58())
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
    feedItems.forEach((item) => {
      if (item.release) {
        audioFeedItems.push(item.release.publicKey)
      }
    })
    resetQueueWithPlaylist(audioFeedItems)
  }

  const handleGetFeedForUser = async (publicKey, refresh=false) => {
    const feed = await getFeedForUser(publicKey, refresh ? 0 : feedItems?.length || 0)
    if (feed){
      const updatedFeedItems = feed?.feedItems.filter(item => {
        return !item.type.includes('Post')
      })
      setTotalItems(feed.total)
      if (feedItems && feedItems.length > 0) {
        setFeedItems(feedItems.concat(updatedFeedItems))
      } else {
        setFeedItems(updatedFeedItems)
      }
    }
  }

  const getHubSuggestionsForUser = async (publicKey) => {
    const suggestions = []
    try {
      const {data} = await axios.get(`${process.env.NINA_API_ENDPOINT}/accounts/${publicKey}/hubSuggestions`)
      data.suggestions.forEach(suggestion => {
        suggestions.push(suggestion)
      })
      setHubSuggestions(suggestions)
    } catch (error) {
      console.warn('error :>> ', error);
      return []
    }
  }


  return (
    <>
      {wallet.connected && (
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
              <FeedHeader>
                <CloseIcon
                  fontSize="medium"
                  onClick={toggleDrawer(false)}
                />
                <DrawerTypeWrapper>
                  {drawerTypes.map((drawerType, index) => {
                    return (
                      <DrawerType
                        key={drawerType}
                        onClick={() => setActiveDrawerTypeIndex(index)}
                        className={activeDrawerTypeIndex === index ? 'active' : ''}
                        variant='h4'
                      >
                        {drawerType}
                      </DrawerType>
                    )
                  })}
                </DrawerTypeWrapper>
                <PlayCircleOutlineOutlinedIcon
                  fontSize="medium"
                  sx={{ paddingRight: '15px'}} 
                  onClick={playFeed}
                />
              </FeedHeader>
      
                {activeDrawerTypeIndex === 0 && (
                  <Feed
                    items={feedItems}
                    toggleDrawer={toggleDrawer}
                    playFeed={playFeed}
                    handleGetFeedForUser={handleGetFeedForUser}
                    publicKey={wallet.publicKey.toBase58()}
                  />
                )}
      
                {activeDrawerTypeIndex === 1 && (
                  <Suggestions 
                    items={hubSuggestions}
                    toggleDrawer={toggleDrawer}
                    publicKey={wallet.publicKey.toBase58()}
                  />
                )}
              
                
              </StyledDrawer>
            </Box>
          </Box>
      )}
    </>
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
    overflowX: 'hidden',
    border: '1px solid black',
    borderRight: 'none',
    [theme.breakpoints.down('md')]: {
      width: '100vw',
    },
  },
}))

const FeedHeader = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  padding: '10px 15px',
  marginRight: '20px',
  background: 'white',
  zIndex:100,
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
}))

const DrawerTypeWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
}))


const DrawerType = styled(Typography)(({ theme }) => ({
  margin: '0 10px',
  cursor: 'pointer',
  fontWeight: 'bold',
  '&.active': {
    textDecoration: 'underline',
  }
}))



export default FeedDrawer
