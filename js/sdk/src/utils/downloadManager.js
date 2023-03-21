import ID3Writer from 'browser-id3-writer'
import { saveAs } from 'file-saver'
import axios from 'axios'
import { logEvent } from './event'

export const downloadAs = async (
  url,
  releasePubkey,
  artwork,
  artist,
  title,
  description,
  link,
  setDownloadId,
  enqueueSnackbar,
  walletAddress,
  hubPubkey
) => {
  setDownloadId(releasePubkey)
  enqueueSnackbar('Downloading Release', { variant: 'info' })

  logEvent('track_download_dashboard', 'engagement', {
    publicKey: releasePubkey,
    hub: hubPubkey,
    wallet: walletAddress,
  })
  try {
    const download = await axios
      .get(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        responseType: 'blob',
      })
      .then(async (res) => {
        const buffer = await res.data.arrayBuffer()
        let image = artwork
        if (image) {
          image = await fetch(image).then((r) => r.blob())
          image = await new Response(image).arrayBuffer()
        }
        const writer = new ID3Writer(buffer)
        writer.setFrame('TIT2', title)
        writer.setFrame('TPE1', [artist])
        writer.setFrame('WPAY', link)
        writer.setFrame('COMM', {
          description: description,
          text: `Downloaded from Nina Protocol: ${link}`,
          language: 'eng',
        })
        writer.setFrame('APIC', {
          type: 3,
          data: image,
          description: 'Cover',
        })
        writer.addTag()
        const blob = writer.getBlob()
        saveAs(blob, `${title}.mp3`)
      })

    enqueueSnackbar('Release Downloaded', { variant: 'success' })
    setDownloadId(undefined)
    return download
  } catch (error) {
    enqueueSnackbar('Release Not Downloaded', { variant: 'error' })
    setDownloadId(undefined)
  }
}

export const downloadAll = async (
  event,
  profileCollection,
  setDownloadCollectionProgress,
  setDownloadingCollection,
  zip,
  enqueueSnackbar,
  walletAddress
) => {
  setDownloadingCollection(true)
  event.stopPropagation()
  enqueueSnackbar(
    'Downloading Collection, this could take a while depending on the size of your Collection.',
    { variant: 'info' }
  )
  const files = profileCollection?.map((release) => {
    return {
      name: release.metadata.name,
      url: release.metadata.properties.files[0].uri,
      artist: release.metadata.properties.artist,
      title: release.metadata.properties.title,
      image: release.metadata.image,
      description: release.metadata.description,
      link: release.metadata.external_url,
      releasePubkey: release.releasePubkey,
    }
  })

  const collection = files?.map((item) => {
    return downloadAndZip(
      item,
      setDownloadCollectionProgress,
      zip,
      walletAddress
    )
  })
  await Promise.all(collection).then(() => {
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `Collection.zip`)
    })
  })
  setDownloadCollectionProgress(0)
  enqueueSnackbar('Collection Downloaded', { variant: 'success' })
  setDownloadingCollection(false)
  return
}

export const downloadAndZip = async (
  item,
  setDownloadCollectionProgress,
  zip,
  walletAddress
) => {
  logEvent('track_download_dashboard', 'engagement', {
    publicKey: item.releasePubkey,
    walletAddress: walletAddress,
  })
  const download = axios
    .get(item.url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'blob',
    })
    .then(async (res) => {
      const buffer = await res.data.arrayBuffer()
      let image = item.image
      if (image) {
        image = await fetch(image).then((r) => r.blob())
        image = await new Response(image).arrayBuffer()
      }
      const writer = new ID3Writer(buffer)
      writer.setFrame('TIT2', item.title)
      writer.setFrame('TPE1', [item.artist])
      writer.setFrame('WPAY', item.link)
      writer.setFrame('COMM', {
        description: item.description,
        text: `Downloaded from Nina Protocol: ${item.link}`,
        language: 'eng',
      })
      writer.setFrame('APIC', {
        type: 3,
        data: image,
        description: 'Cover',
      })
      writer.addTag()
      const blob = writer.getBlob()
      zip.file(`${item.name}.mp3`, blob, { binary: true })
    })
    .then(() =>
      setDownloadCollectionProgress(
        (downloadCollectionProgress) => downloadCollectionProgress + 1
      )
    )
  return download
}
