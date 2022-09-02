import { Box } from '@mui/system'
import Link from 'next/link'
const HubRelease = ({
  onPlay,
  onQueue,
  artistName,
  trackName,
  trackUrl,
  trackId,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1 }}>
      <Box
        sx={{
          mr: 1,
          pr: 1,
          cursor: 'pointer',
          '&:hover': {
            fontStyle: 'italic',
          },
        }}
        onClick={onPlay}
        id={trackId}
      >
        play
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
        id={trackId}
        key={trackName}
        onClick={onQueue}
      >
        queue
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
        <Link href={trackUrl} passHref>
          <a target="_blank" rel="noopener noreferrer">
            <Box sx={{ mr: 1, pr: 1, cursor: 'pointer', fontWeight: 'medium' }}>
              {artistName}
            </Box>
          </a>
        </Link>
        <Link href={trackUrl} passHref>
          <a target="_blank" rel="noopener noreferrer">
            <Box sx={{ fontWeight: 'light' }}>{trackName}</Box>
          </a>
        </Link>
      </Box>
    </Box>
  )
}

export default HubRelease
