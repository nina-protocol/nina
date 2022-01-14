import { useState } from "react";
import NextImage from "next/image";
import { DateTime } from "luxon";

export default function Image({ src, height, width, layout, priority, release }) {
  const [ready, setReady] = useState(false);

  const handleLoad = (event) => {
    event.persist();
    if (event.target.srcset) {
      setReady(true);
    }
  };
  let ImageComponent
  if (release) {
    const now = DateTime.now()
    const releaseDatetime = DateTime.fromMillis(release.tokenData.releaseDatetime.toNumber() * 1000)
    const hours = now.diff(releaseDatetime, 'hours').toObject().hours

    if (hours > 1) {
      ImageComponent = () => (
        <img src={src} />
      )
    }
  }
  if (!ImageComponent) {
    ImageComponent = () => (<NextImage
      src={src}
      height={height}
      width={width}
      priority={priority}
      layout={layout}
      onLoad={handleLoad}
    />)
  }
  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity .3s ease-in-out",
      }}
    >
      <ImageComponent />
    </div>
  );
}
