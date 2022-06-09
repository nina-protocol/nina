/* eslint-disable react/display-name */
import React, { useState } from "react";
import NextImage from "next/image";

function Image({ src, height, width, layout, priority }) {
  const [ready, setReady] = useState(false);
  const handleLoad = (event, byPass) => {
    event.persist()
    if (event.target.srcset || byPass) {
      setReady(true)
    }
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  return (
      <NextImage
        src={src}
        height={height}
        width={width}
        priority={priority}
        layout={layout}
        onLoad={(e) => handleLoad(e, false)}
        loader={loaderProp}
      />
  )
}

export default Image
