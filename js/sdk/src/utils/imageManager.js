import ImgixClient from '@imgix/js-core'

export const getImageFromCDN = (url, width = 400, date) => {
  let image = url
  const now = new Date()
  if (!date || (now - date) / 1000 > 120) {
    const client = new ImgixClient({
      domain: process.env.IMGIX_URL,
      secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
    })

    image = client.buildURL(url, {
      width,
      fm: 'webp',
    })
  }
  image.concat(`?auto=compress,format`)
  return image
}

export const loader = ({ src, width }) => {
  const url = new URL(src)
  if (src.includes('&s=')) {
    let fixedURL = src.replace(`&s=${url.searchParams.get('s')}`, '')
    return (fixedURL += `&s=${url.searchParams.get('s')}`)
  }

  return url
}
