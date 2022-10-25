import React, { useContext } from 'react'
import Image from 'next/image'
import { useState, useRef, useMemo } from 'react'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box  from '@mui/material/Box'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
const { getImageFromCDN, loader } = imageManager
import Typography from '@mui/material/Typography'
import { useRouter } from "next/router";
import Subscribe from './Subscribe'
import { useSnackbar } from 'notistack'

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

const Suggestions = ({ items, itemsTotal, publicKey }) => {
  const router = useRouter();

  const [followPending, setFollowPending] = useState(false)
  const [pendingFetch, setPendingFetch] = useState(false)
  const scrollRef = useRef()
  const { enqueueSnackbar } = useSnackbar()


  const handleClick = (e, path) => {
    e.stopPropagation()
    e.preventDefault()
    router.push(path)
  }

  const getSuggestionReason = (item) => {
    let data = {...item}
    delete data.hub
    const relevanceCounts = Object.fromEntries(
      Object.entries(data).sort(([,a],[,b]) => a-b)
    )
    const reason = Object.entries(relevanceCounts).pop()
    const reasonMessage = suggestionCopyFormatter(reason[0], reason[1])
    return reasonMessage
  }


  const suggestionCopyFormatter = (reason, count) => {  
    const pluralize = count > 1
    const suggestions = {
      collectedCount: `This Hub has ${count} release${pluralize ? 's' : ''} you’ve collected`,
      publishedCount: `This Hub has ${count} release${pluralize ? 's' : ''} you’ve published`,
      hubSubscriptionCount: `This Hub is followed by people ${count} you follow`,
      collectorHubCount: `${count} collector${pluralize ? 's' : ''} of your Releases are part of this Hub`,
      hubReleaseCount: ` Releases on your Hub are also on this Hub`
    }
    if (suggestions[reason]) {
      return suggestions[reason]
    }
  } 

  
  const feedItems = useMemo(() => {
    const feedItemComponents = items?.map((item, i) => {
    const hub = item.hub
    const reason = getSuggestionReason(item)
      return (
        <ImageCard>
          <HoverContainer href={`/hubs/${hub?.handle}`}  passHref
            onClick={(e) => handleClick(e, `/hubs/${hub?.handle}`)}
          >
            <Image
              height={'100px'}
              width={'100px'}
              layout="responsive"
              src={getImageFromCDN(
                hub.data?.image,
                400,
                Date.parse(hub.datetime)
              )}
              alt={i}
              priority={true}
              loader={loader}
              unoptimized={true}
            />
            <HoverCard>
              <CtaWrapper>
                <Subscribe accountAddress={hub.publicKey} hubHandle={hub.handle}/>
              </CtaWrapper>
            </HoverCard>
          </HoverContainer>
          <CopyWrapper>
            <Typography my={1}>
              <Link href={`/hubs/${hub?.handle}`} passHref>
                {`${hub.data.displayName}`}</Link> created by <Link href={`/profiles/${hub.authority}`} passHref>{`${truncateAddress(hub?.authority)}`}
              </Link>
            </Typography>

            <Typography my={1}>{reason}</Typography>

          </CopyWrapper>
        </ImageCard>
      )
    })
    return feedItemComponents
  }, [items]);

  return (
    <ScrollWrapper>
      <Box>
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
  padding: '15px',
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

const CardWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '15px 0px',
}))

const ImageCard =  styled(Box)(({ theme }) => ({
  minHeight: '300px',
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
    margin: 'auto',
    '& button': {
      border: '1px solid',
      borderRadius: '0px',
    }
}))

export default Suggestions