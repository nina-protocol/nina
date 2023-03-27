import ID3Writer from 'browser-id3-writer'
import { saveAs } from 'file-saver'
import { logEvent } from './event'
import getFromArweaveWithFallback from './getFromArweaveWithFallback'
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
    const audioFile = await getFromArweaveWithFallback(
      uri,
      { 'Content-Type': 'application/octet-stream' },
      'blob'
    )

    const artwork = await getFromArweaveWithFallback(image, {}, 'arraybuffer')

    const writer = new ID3Writer(await audioFile.data.arrayBuffer())
    writer.setFrame('TIT2', title)
    writer.setFrame('TPE1', [artist])
    writer.setFrame('WPAY', external_url)
    writer.setFrame('COMM', {
      description: description,
      text: `Nina Protocol - ${external_url}`,
      language: 'eng',
    })
    if (artwork) {
      writer.setFrame('APIC', {
        type: 3,
        data: artwork.data,
        description: 'Cover',
      })
    }
    writer.addTag()

    const blob = writer.getBlob()
    const formattedTitle = title.replaceAll('/', '-')
    const formattedArtist = artist.replaceAll('/', '-')
    saveAs(blob, `${formattedArtist} - ${formattedTitle}.mp3`)

    enqueueSnackbar('Release Downloaded', { variant: 'success' })
    if (inRow) {
      setDownloadId(undefined)
    }
    return
  } catch (error) {
    enqueueSnackbar('Release Not Downloaded', { variant: 'error' })
    if (inRow) {
      setDownloadId(undefined)
    }
  }
}
