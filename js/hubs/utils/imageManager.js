import ImgixClient from '@imgix/js-core';

export const getImageFromCDN = (url, width) => {
  const client = new ImgixClient({
    domain: 'nina-dev.imgix.net',
    secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
  });

  const image = client.buildURL(url, {
    width,
  });

  return image
}

export const loader = ({src}) => {
  const url = new URL(src)
  let fixedURL = src.replace(`&s=${url.searchParams.get('s')}`, '')
  return fixedURL += `&s=${url.searchParams.get('s')}`
}
