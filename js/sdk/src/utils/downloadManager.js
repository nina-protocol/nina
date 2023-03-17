import ID3Writer from 'browser-id3-writer'
import { saveAs } from 'file-saver'
import axios from 'axios'
// import { logEvent } from 'utils/analytics'
// const { enqueueSnackbar } = useSnackbar()
export const downloadAs = async (
  url,
  name,
  releasePubkey,
  artwork,
  artist,
  title,
  setDownloadId,
  enqueueSnackbar
) => {
  setDownloadId(releasePubkey)
  //   logEvent('track_download_dashboard', 'engagement', {
  //     publicKey: releasePubkey,
  //   })
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
        writer
          .setFrame('APIC', {
            type: 3,
            data: image,
            description: 'Cover',
          })
          .addTag()
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
  zip
) => {
  setDownloadingCollection(true)
  event.stopPropagation()
  const files = profileCollection.map((release) => {
    return {
      name: release.metadata.name,
      url: release.metadata.properties.files[0].uri,
      artist: release.metadata.properties.artist,
      title: release.metadata.properties.title,
      image: release.metadata.image,
    }
  })

  const collection = files.map((item) => {
    return downloadAndZip(item, setDownloadCollectionProgress, zip)
  })
  await Promise.all(collection).then(() => {
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'collection.zip')
    })
  })
  setDownloadCollectionProgress(0)
  setDownloadingCollection(false)
  return
}

export const downloadAndZip = async (
  item,
  setDownloadCollectionProgress,
  zip
) => {
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
      writer
        .setFrame('APIC', {
          type: 3,
          data: image,
          description: 'Cover',
        })
        .addTag()
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
