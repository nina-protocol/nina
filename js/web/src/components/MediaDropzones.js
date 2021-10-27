import React, { useState, useEffect } from 'react'
import MediaDropzone from './MediaDropzone.js'

function MediaDropzones({
  values,
  releasePubkey,
  artwork,
  setArtwork,
  track,
  setTrack,
}) {
  const [metadata, setMetadata] = useState({})

  useEffect(() => {
    setMetadata({
      artist: values.mediaForm?.artist,
      title: values.mediaForm?.title,
      description: values.mediaForm?.description,
      catalogNumber: values.tokenForm?.catalogNumber,
      duration: track ? track.meta?.duration : 0,
      resalePercentage: values.tokenForm.resalePercentage * 100,
    })
  }, [values, track])

  return (
    <div>
      <label htmlFor="artwork"></label>
      <MediaDropzone
        type="artwork"
        artwork={artwork}
        setArtwork={setArtwork}
        releasePubkey={releasePubkey}
        metadata={metadata}
      />

      <label htmlFor="track"></label>
      <MediaDropzone
        type="track"
        releasePubkey={releasePubkey}
        track={track}
        setTrack={setTrack}
      />
    </div>
  )
}

export default MediaDropzones
