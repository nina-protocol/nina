import dynamic from 'next/dynamic'
import { Box } from '@mui/system';
const HubRelease = dynamic(() => import('./HubRelease'))
const HubReleases = ({releases, onPlay, onQueue}) => {
   
    return (
        releases.map((release) => (
            <Box key={release.releasePubKey} id={release.releasePubKey}>
              <HubRelease
                onPlay={onPlay}
                onQueue={onQueue}
                artistName={release.properties.artist}
                trackName={release.properties.title}
                trackUrl={release.external_url}
                trackId={release.releasePubKey}
              />
            </Box>
          ))
    );
}

export default HubReleases;