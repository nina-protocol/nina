import React, { useState, useMemo } from "react";
import NextImage from "next/image";
import { DateTime } from "luxon";

function Image({ src, height, width, layout, priority, release }) {
  const [ready, setReady] = useState(false);

  const handleLoad = (event, byPass) => {
    event.persist();
    if (event.target.srcset || byPass) {
      setReady(true);
    }
  };
  let ImageComponent
  if (release) {
    if (release.tokenData) {
      release = release.tokenData
    }
    const now = DateTime.now()
    const releaseDatetime = DateTime.fromMillis(release.releaseDatetime.toNumber() * 1000)
    const hours = now.diff(releaseDatetime, 'hours').toObject().hours

    if (hours < 0.05) {
      if (src) {
        ImageComponent = () => (    
          <img src={src}
            onLoad={e => handleLoad(e, true)}
            style={{width: '100%', height: '100%'}}
          />
        )
      }
    }
  }
  if (!ImageComponent) {
    ImageComponent = () => (<NextImage
      src={src}
      height={height}
      width={width}
      priority={priority}
      layout={layout}
      onLoad={e => handleLoad(e, false)}
    />)
  } else {

  }
  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity .3s ease-in-out",
      }}
      className="imageWrapper"
    >
      <ImageComponent />
    </div>
  );
}

function srcComparision(prevImage, nextImage) {
  return prevImage.src === nextImage.src && nextImage.release
}

const MemoizedImage = React.memo(Image, srcComparision);
export default MemoizedImage;
