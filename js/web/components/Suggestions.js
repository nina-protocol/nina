import React, { useContext } from 'react'
import Image from 'next/image'
import { useState, useRef, useMemo } from 'react'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box  from '@mui/material/Box'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
const { getImageFromCDN, loader } = imageManager
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import Audio from "@nina-protocol/nina-internal-sdk/esm/Audio";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' year' : ' years')
  }
  interval = seconds / 2592000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' month' : ' months')
  }
  interval = seconds / 86400
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' day' : ' days')
  }
  interval = seconds / 3600
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' hour' : ' hours')
  }
  interval = seconds / 60
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' minute' : ' minutes')
  }
  return Math.floor(seconds) + ' seconds'
}

const Suggestions = ({ items, itemsTotal, toggleDrawer, playFeed, handleGetFeedForUser}) => {
  const { updateTrack, isPlaying, setIsPlaying, track } = useContext(Audio.Context);
  const router = useRouter();

  const [pendingFetch, setPendingFetch] = useState(false)
  const scrollRef = useRef()

  const handleScroll = () => {
    const bottom =
      scrollRef.current.getBoundingClientRect().bottom - 250 <=
      window.innerHeight
    if (
      bottom &&
      !pendingFetch &&
      itemsTotal !== items.length
    ) {
      setPendingFetch(true)
      handleGetFeedForUser()
    }
  }

   const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleClick = (e, path) => {
    console.log('path :>> ', path);
    e.stopPropagation()
    e.preventDefault()
    router.push(path)

  }
  

  const feedItems = useMemo(() => {
    const feedItemComponents = items?.map((item, i) => {
      <Typography>{i}</Typography>
    })
    return feedItemComponents
  }, [items, isPlaying]);

  return (
    <ScrollWrapper
      onScroll={debounce(() => handleScroll(), 500)}
    >
      <Box>
        <FeedHeader sx={{display: 'flex', width: '100%'}}>
          <CloseIcon
            fontSize="medium"
            onClick={toggleDrawer(false)}
          />
          <Typography variant="h4">LATEST</Typography>
          <PlayCircleOutlineOutlinedIcon
            fontSize="medium"
            sx={{ paddingRight: '15px'}} 
            onClick={playFeed}
          />
        </FeedHeader>
        <FeedWrapper ref={scrollRef}>
          {feedItems && feedItems?.map((item, index) => (
            <CardWrapper>
              {item}
            </CardWrapper>
          ))}
        </FeedWrapper>
        {itemsTotal === items?.length &&
          <Typography variant="h4" sx={{textAlign: 'center'}}>No more items</Typography>
        }
      </Box>
     </ScrollWrapper>
  )
}

const ScrollWrapper = styled(Box)(({ theme }) => ({
  overflowY: 'scroll',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': { 
    display: 'none'  /* Safari and Chrome */
  },
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    padding: '100px 0px',
    overflowY: 'scroll',
  },
}))

const FeedWrapper = styled(Box)(({ theme }) => ({
  padding: '18px',
  marginTop: '30px',
  minHeight: '75vh',
  '& a': {
    color: theme.palette.blue,
  },
  [theme.breakpoints.down('md')]: {
    padding: '0px 30px',
    overflowX: 'auto',
    minHeight: '80vh',
  },
}))

const FeedHeader = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  padding: '10px',
  marginRight: '20px',
  background: 'white',
  zIndex:100,
  '& .MuiTypography-h4': {
    top: '50%',
    fontWeight: 'bold',
    margin: '0 auto',
  },  
}))

const CardWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '15px 0px',
}))

const TextCard = styled(Box)(({ theme }) => ({
  border: '1px solid',
}))

// const MultiCard = styled(Box)(({ theme }) => ({
//   height: 'auto',
//   maxHeight: '250px',
//   border: '1px solid',
//   '& img': {
//     cursor: 'pointer',
//   }
// }))

const ImageCard =  styled(Box)(({ theme }) => ({
  minHeight: '300px',
  // maxHeight: '500px',
  height: 'auto',
  border: '1px solid',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  '& img': {
    cursor: 'pointer',
  },
}))

const CopyWrapper =  styled(Box)(({ theme }) => ({
  padding: '0 15px',
  margin: '5px 0px 15px',
}))

const HoverContainer =  styled(Box)(({ theme }) => ({
  position: 'relative'
}))

const HoverCard =  styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  opacity: 0,
  cursor: 'pointer',
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.background.default + "c4",
  }
}))

const CtaWrapper =  styled(Box)(({ theme }) => ({
    margin: 'auto'
}))




export default Suggestions