import { useContext } from 'react'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useSnackbar } from 'notistack'

const { getImageFromCDN, loader } = imageManager

const ProfileCollections = ({ profileCollection, onPlay, onQueue }) => {
  if (profileCollection.length === 0)
    return <Box>This address has no collection yet</Box>

  return profileCollection.map((release) => (
    <Box key={release.metadata.properties.name}>
      <ProfileCollection
        artist={release.metadata.properties.artist}
        title={release.metadata.properties.title}
        onPlay={onPlay}
        onQueue={onQueue}
        releasePubkey={release.releasePubkey}
        trackName={release.metadata.properties.name}
        image={release.metadata.image}
        date={release.metadata.date}
      />
    </Box>
  ))
}
const ProfileCollection = ({
  artist,
  title,
  releasePubkey,
  trackName,
  image,
  date,
}) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
  } = useContext(Audio.Context)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, { persistent: 'true' })
    setTimeout(() => closeSnackbar(snackbarMessage), 1000)
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
  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '50vw',
        textAlign: 'left',
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
      <Box sx={{ mr: 3, pr: 3 }}>
        <Button
          sx={{
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
      </Box>

      <Box sx={{ width: '50px', height: 'auto', mr: 1, cursor: 'pointer' }}>
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

export default ProfileCollections
