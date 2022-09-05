import { Box } from '@material-ui/core'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const ProfileCollections = ({ profileCollection, onPlay, onQueue }) => {
  return profileCollection.map((collection) => (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1 }}
      key={collection.metadata.properties.name}
    >
      <ProfileCollection
        artist={collection.metadata.properties.artist}
        title={collection.metadata.properties.title}
        collectionUrl={collection.metadata.properties.external_url}
        onPlay={onPlay}
        onQueue={onQueue}
        trackId={collection.releasePubkey}
        trackName={collection.metadata.properties.name}
      />
    </Box>
  ))
}
const ProfileCollection = ({ collectionUrl, artist, title, onPlay, onQueue, trackId, trackName }) => {
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
      <Link href={`${collectionUrl ? collectionUrl : ''}`} passHref>
        <a
          target="_blank"
          rel="noopener noreferrer"
        >{`${artist} - ${title}`}</a>
      </Link>
    </Box>
  )
}

export default ProfileCollections
