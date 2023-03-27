import ID3Writer from 'browser-id3-writer'
import { saveAs } from 'file-saver'
import axios from 'axios'
import { logEvent } from './event'

export const downloadAs = async (
  metadata,
  releasePubkey,
  setDownloadId,
  enqueueSnackbar,
  walletAddress,
  hubPubkey,
  inRow
) => {
  let artist = metadata.properties
    ? metadata.properties.artist
    : metadata.artist
  let title = metadata.properties
    ? metadata.properties.title
    : metadata.releaseName
  let uri = metadata.properties
    ? metadata.properties.files[0].uri
    : metadata.uri
  let image = metadata.image
  let external_url = metadata.external_url
  let description = metadata.description
  if (inRow) {
    setDownloadId(releasePubkey)
  }
  enqueueSnackbar('Downloading Release', { variant: 'info' })

  logEvent('track_download_dashboard', 'engagement', {
    publicKey: releasePubkey,
    hub: hubPubkey,
    wallet: walletAddress,
  })
  try {
    const download = await axios
      .get(uri, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        responseType: 'blob',
      })
      .then(async (res) => {
        const buffer = await res.data.arrayBuffer()

        let artwork = image
        if (image) {
          artwork = await axios
            .get(image, {
              method: 'GET',
              responseType: 'arraybuffer',
            })
            .then((res) => res.data)
            .catch((err) => console.error(err))
        }
        const writer = new ID3Writer(buffer)

        writer.setFrame('TIT2', title)
        writer.setFrame('TPE1', [artist])
        writer.setFrame('WPAY', external_url)
        writer.setFrame('COMM', {
          description: description,
          text: `Nina Protocol - ${external_url}`,
          language: 'eng',
        })
        writer.setFrame('APIC', {
          type: 3,
          data: artwork,
          description: 'Cover',
        })
        writer.addTag()

        const blob = writer.getBlob()

        const formattedTitle = title.split('/').join('-')

        const formattedArtist = artist.split('/').join('-')
        saveAs(blob, `${formattedArtist} - ${formattedTitle}.mp3`)
      })

    enqueueSnackbar('Release Downloaded', { variant: 'success' })
    if (inRow) {
      setDownloadId(undefined)
    }
    return download
  } catch (error) {
    enqueueSnackbar('Release Not Downloaded', { variant: 'error' })
    if (inRow) {
      setDownloadId(undefined)
    }
  }
}
