import ImgixClient from '@imgix/js-core';

export const getImageFromCDN = (url, width=400) => {
  const client = new ImgixClient({
    domain: process.env.IMGIX_URL,
    secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
  });

  const image = client.buildURL(url, {
    width,
    fm: 'webp'
  });

  return image
}

export const loader = ({src}) => {
  const url = new URL(src)
  let fixedURL = src.replace(`&s=${url.searchParams.get('s')}`, '')
  return fixedURL += `&s=${url.searchParams.get('s')}`
}
