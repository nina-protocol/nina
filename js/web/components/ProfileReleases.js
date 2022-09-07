import { Box } from '@mui/system'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useContext } from 'react'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
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
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)

  const handlePlay = (e, releasePubKey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubKey === releasePubKey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubKey, true, true)
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
     
      }}
    >
      <Box
        sx={{
          p: 1,
          m: 1,
          cursor: 'pointer',
        }}
        onClick={(e) => handlePlay(e, releasePubkey)}
        id={releasePubkey}
      >
        {isPlaying && track.releasePubkey === releasePubkey ? (
          <PlayCircleOutlineOutlinedIcon
            sx={{ color: 'black' }}
            onClick={(e) => handlePlay(e, releasePubkey)}
            id={releasePubkey}
          />
        ) : (
          <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
        )}
      </Box>
      <Box sx={{mr:3, pr:3}} id={releasePubkey}>
        <ControlPointIcon
          sx={{ color: 'black' }}
          key={trackName}
          onClick={() => addTrackToQueue(releasePubkey)}
        />
      </Box>
      <Box sx={{ width: '50px', height: '50px', mr:1 }}>
        <Image
          height={'100%'}
          width={'100%'}
          layout="responsive"
          src={getImageFromCDN(image, 400, new Date(Date.parse(date)))}
          alt={trackName}
          priority={true}
          loader={loader}
        />
      </Box>
      <Link href={`/${releasePubkey}`} passHref prefetch>
        <a>{`${artist} - ${title}`}</a>
      </Link>
    </Box>
  )
}
export default ProfileReleases
