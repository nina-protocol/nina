import React, { useState } from 'react'
import NextImage from 'next/image'
import { DateTime } from 'luxon'

function Image({ src, height, width, layout, priority, release }) {
  const [ready, setReady] = useState(false)
  const handleLoad = (event, byPass) => {
    event.persist()
    if (event.target.srcset || byPass) {
      setReady(true)
    }
  }
  
  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity .3s ease-in-out',
      }}
      className="imageWrapper"
    >
      <NextImage
        src={src}
        height={height}
        width={width}
        priority={priority}
        layout={layout}
        onLoad={(e) => handleLoad(e, false)}
      />
    </div>
  )
}

function srcComparision(prevImage, nextImage) {
  return prevImage.src === nextImage.src && nextImage.release
}

const MemoizedImage = React.memo(Image, srcComparision)
export default MemoizedImage
