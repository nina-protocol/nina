import { createContext, useState, useContext, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'

import NinaClient from '../utils/client'

export const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { collection, shouldRemainInCollectionAfterSale } =
    useContext(NinaContext)
  const { releaseState } = useContext(ReleaseContext)
  const { connection } = useContext(ConnectionContext)
  const [txid, setTxid] = useState(null)
  const [playlist, setPlaylist] = useState([])

  useEffect(() => {
    if (
      wallet?.connected &&
      playlist.length == 0 &&
      Object.keys(collection)?.length > 0
    ) {
      createPlaylistFromTracks()
    }
  }, [wallet?.connected, collection, releaseState.metadata])

  const {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToPlaylist,
  } = audioPlayerContextHelper({
    releaseState,
    wallet,
    connection,
    collection,
    playlist,
    setPlaylist,
    shouldRemainInCollectionAfterSale,
  })

  const updateTxid = (newTxid, releasePubkey) => {
    addTrackToPlaylist(releasePubkey)
    if (newTxid === txid) {
      setTxid(newTxid + '?ext=mp3')
    } else {
      setTxid(newTxid)
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        txid,
        updateTxid,
        playlist,
        reorderPlaylist,
        removeTrackFromPlaylist,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export default AudioPlayerContextProvider

const audioPlayerContextHelper = ({
  tracks,
  setTracks,
  releaseState,
  playlist,
  setPlaylist,
  collection,
  shouldRemainInCollectionAfterSale,
}) => {
  const reorderPlaylist = ({ source, destination }) => {
    const updatedPlaylist = [...playlist]
    NinaClient.arrayMove(updatedPlaylist, source.index, destination.index)

    setPlaylist([...updatedPlaylist])
  }

  const removeTrackFromPlaylist = async (releasePubkey) => {
    const remain = await shouldRemainInCollectionAfterSale(
      releasePubkey,
      releaseState.releaseMintMap[releasePubkey]
    )
    if (!remain) {
      const updatedPlaylist = playlist.filter(
        (playlistItem) => playlistItem.releasePubkey !== releasePubkey
      )

      const updatedTracks = { ...tracks }
      delete updatedTracks[releasePubkey]

      setPlaylist(updatedPlaylist)
      setTracks(updatedTracks)
    }
  }

  /*

  UTILS

  */

  const createPlaylistFromTracks = () => {
    const playlistEntries = []
    Object.keys(collection).forEach((releasePubkey) => {
      const playlistEntry = createPlaylistEntry(releasePubkey)
      if (playlistEntry) {
        playlistEntries.push(playlistEntry)
      }
    })
    setPlaylist([...playlist, ...playlistEntries])
  }

  const addTrackToPlaylist = (releasePubkey) => {
    const playlistEntry = createPlaylistEntry(releasePubkey)
    if (playlistEntry) {
      setPlaylist([...playlist, playlistEntry])
    }
  }

  const createPlaylistEntry = (releasePubkey) => {
    let playlistEntry = undefined
    if (!playlist.some((item) => item.releasePubkey === releasePubkey)) {
      const releaseMetadata = releaseState.metadata[releasePubkey]
      if (releaseMetadata) {
        playlistEntry = {
          artist: releaseMetadata.properties.artist,
          title: releaseMetadata.properties.title,
          txid: releaseMetadata.properties.files[0].uri,
          releasePubkey,
          cover: releaseMetadata.image,
          duration: releaseMetadata.properties.files[0].duration,
        }
      }
    }

    return playlistEntry
  }

  return {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToPlaylist,
  }
}
