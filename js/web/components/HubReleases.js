import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useContext } from 'react'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
const { getImageFromCDN, loader } = imageManager
const HubReleases = ({ hubReleases, onPlay, handleAddTrackToQueue }) => {
  if (hubReleases?.length === 0)
    return <Box>No releases belong to this Hub</Box>
  return hubReleases.map((release) => (
    <Box key={release.releasePubkey} id={release.releasePubkey}>
      <HubRelease
        onPlay={onPlay}
        handleAddTrackToQueue={handleAddTrackToQueue}
        artist={release.properties.artist}
        title={release.properties.title}
        trackUrl={release.external_url}
        releasePubkey={release.releasePubkey}
        image={release.image}
        date={release.properties.date}
      />
    </Box>
  ))
}

const HubRelease = ({
  artist,
  trackName,
  title,
  releasePubkey,
  image,
  date,
}) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    playlist,
    track,
  } = useContext(Audio.Context)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, { persistent: 'true' })
    setTimeout(() => closeSnackbar(snackbarMessage), 1000)
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

  const handleQueue = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'left',
        width: '50vw',
      }}
    >
      <Box sx={{ p: 1 }}>
        <Button
          sx={{ cursor: 'pointer' }}
          id={releasePubkey}
          key={trackName}
          onClick={(e) => handleQueue(e, releasePubkey)}
        >
          <ControlPointIcon
            sx={{ color: 'black' }}
            key={trackName}
            onClick={(e) => handleQueue(e, releasePubkey)}
          />
        </Button>
      </Box>
      
      <Button
        sx={{
          mr: 3,
          pr: 3,
          cursor: 'pointer',
        }}
        onClick={(e) => handlePlay(e, releasePubkey)}
        id={releasePubkey}
      >
        {isPlaying && track.releasePubkey === releasePubkey ? (
          <PauseCircleOutlineOutlinedIcon
            sx={{ color: 'black' }}
            onClick={(e) => handlePlay(e, releasePubkey)}
            id={releasePubkey}
          />
        ) : (
          <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
        )}
      </Button>

      <Box sx={{ width: '30px', height: 'auto', mr: 1, cursor: 'pointer' }}>
        <Link href={`/${releasePubkey}`} passHref prefetch>
          <a>
            <Image
              height={'100%'}
              width={'100%'}
              layout="responsive"
              src={getImageFromCDN(image, 400, new Date(Date.parse(date)))}
              alt={trackName}
              priority={true}
              loader={loader}
            />
          </a>
        </Link>
      </Box>
      <Box
        sx={{
          mr: 1,
          pr: 1,
          flexGrow: 1,
          overflow: 'hidden',
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <Link href={`/${releasePubkey}`} passHref prefetch>
          <a>
            <Typography
              noWrap
              sx={{ cursor: 'pointer' }}
            >{`${artist} - ${title}`}</Typography>
          </a>
        </Link>
      </Box>
    </Box>
  )
}

export default HubReleases
