import { Box } from '@mui/system'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useContext } from 'react'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { Button, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
const { getImageFromCDN, loader } = imageManager
const ProfileReleases = ({ profileReleases, onPlay, onQueue }) => {
  if (profileReleases?.length === 0)
    return <Box>No releases belong to this address</Box>
  return profileReleases.map((release) => (
    <Box key={release.metadata.name}>
      <ProfileRelease
        artist={release.metadata.properties.artist}
        title={release.metadata.properties.title}
        releaseUrl={release.metadata.external_url}
        onPlay={onPlay}
        onQueue={onQueue}
        releasePubkey={release.releasePubkey}
        trackName={release.metadata.properties.name}
        image={release.metadata.image}
        date={release.metadata.properties.date}
      />
    </Box>
  ))
}

const ProfileRelease = ({
  artist,
  image,
  title,
  releasePubkey,
  trackName,
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
        }}
        onClickCapture={(e) => handlePlay(e, releasePubkey)}
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
export default ProfileReleases
