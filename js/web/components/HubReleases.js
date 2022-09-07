import { Box } from '@mui/system'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useContext } from 'react'

const HubReleases = ({ hubReleases, onPlay, handleAddTrackToQueue }) => {
  if (hubReleases?.length === 0)
    return <Box>No releases belong to this Hub</Box>
  return hubReleases.map((release) => (
    <Box key={release.releasePubkey} id={release.releasePubkey}>
      <HubRelease
        onPlay={onPlay}
        handleAddTrackToQueue={handleAddTrackToQueue}
        artistName={release.properties.artist}
        trackName={release.properties.title}
        trackUrl={release.external_url}
        releasePubkey={release.releasePubkey}
        image={release.properties.image}
        date={release.properties.date}
      />
    </Box>
  ))
}

const HubRelease = ({ artistName, trackName, trackUrl, releasePubkey, image, date }) => {
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)

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
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1 }}>
      <Box
        sx={{
          mr: 1,
          pr: 1,
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
      <Box
        sx={{
          mr: 3,
          pr: 3,
          cursor: 'pointer',
          '&:hover': {
            fontStyle: 'italic',
          },
        }}
        id={releasePubkey}
        key={trackName}
        onClick={() => addTrackToQueue(releasePubkey)}
      >
        <ControlPointIcon
          sx={{ color: 'black' }}
          key={trackName}
          onClick={() => addTrackToQueue(releasePubkey)}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          '&:hover': {
            textDecoration: 'underline #000000',
          },
        }}
      >
        <Link href={`/${releasePubkey}`} passHref prefetch>
          <a>
            <Box
              sx={{
                mr: 1,
                pr: 1,
                cursor: 'pointer',
                fontWeight: 'medium',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whitespace: 'normal'
              }}
            >
              {`${artistName}`}
            </Box>
          </a>
        </Link>
        <Box sx={{width:"50px", height: "50px", mr:1}}> 
        <Image
          height={"100%"}
          width={"100%"}
          layout="responsive"
          src={getImageFromCDN(image, 400, new Date(Date.parse(date)))}
          alt={trackName}
          priority={true}
          loader={loader}
        />
        </Box>
        <Link href={trackUrl} passHref prefetch>
          <a>
            <Box
              sx={{
                fontWeight: 'light',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whitespace:'normal'
              }}
            >
              {trackName}
            </Box>
          </a>
        </Link>
      </Box>
    </Box>
  )
}

export default HubReleases
