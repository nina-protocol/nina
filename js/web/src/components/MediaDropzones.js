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
      artist: values.releaseForm?.artist,
      title: values.releaseForm?.title,
      description: values.releaseForm?.description,
      catalogNumber: values.releaseForm?.catalogNumber,
      duration: track ? track.meta?.duration : 0,
      resalePercentage: values.releaseForm.resalePercentage * 100,
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
