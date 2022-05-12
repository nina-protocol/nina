import React, { createContext, useState, useContext, useEffect } from 'react'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'

export const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const { collection, shouldRemainInCollectionAfterSale, ninaClient } =
    useContext(NinaContext)
  const { provider } = ninaClient
  const { releaseState } = useContext(ReleaseContext)
  const [txid, setTxid] = useState(null)
  const [track, setTrack] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  const updateTrack = (releasePubkey, shouldPlay = false) => {
    const newTrack = playlist.filter(
      (item) => item.releasePubkey === releasePubkey
    )[0]
    if (newTrack) {
      setTrack(newTrack)
    }
    setIsPlaying(shouldPlay)
  }

  const playPrev = (shouldPlay = false) => {
    if (playlist[currentIndex() - 1]) {
      setTrack(playlist[currentIndex() - 1])
      setIsPlaying(shouldPlay)
    }
  }

  const playNext = (shouldPlay = false) => {
    if (playlist[currentIndex() + 1]) {
      setTrack(playlist[currentIndex() + 1])
      setIsPlaying(shouldPlay)
    }
  }

  useEffect(() => {
    if (
      provider.wallet?.connected &&
      playlist.length == 0 &&
      Object.keys(collection)?.length > 0
    ) {
      createPlaylistFromTracks()
    }
  }, [provider.wallet?.connected, collection, releaseState.metadata])

  const updateTxid = async (newTxid, releasePubkey, shouldPlay = false) => {
    if (newTxid !== playlist[currentIndex()]) {
      if (!playlist.some((item) => item.releasePubkey === releasePubkey)) {
        addTrackToQueue(releasePubkey)
      }
      setTxid(newTxid)
      setIsPlaying(shouldPlay)
    }
  }

  const {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToQueue,
    removeTrackFromQueue,
    resetQueueWithPlaylist,
  } = audioPlayerContextHelper({
    releaseState,
    collection,
    playlist,
    setPlaylist,
    shouldRemainInCollectionAfterSale,
    setTxid,
    setIsPlaying,
    setTrack,
  })

  const currentIndex = () => {
    let index = undefined
    playlist.forEach((item, i) => {
      if (item.txid === txid) {
        index = i
        return
      }
    })
    return index
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        track,
        updateTrack,
        playNext,
        playPrev,
        txid,
        updateTxid,
        playlist,
        reorderPlaylist,
        removeTrackFromPlaylist,
        addTrackToQueue,
        removeTrackFromQueue,
        isPlaying,
        setIsPlaying,
        currentIndex,
        resetQueueWithPlaylist,
        createPlaylistFromTracks
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export default AudioPlayerContextProvider

const audioPlayerContextHelper = ({
  tracks,
  releaseState,
  playlist,
  setPlaylist,
  collection,
  shouldRemainInCollectionAfterSale,
  setTxid,
  setIsPlaying,
}) => {
  const reorderPlaylist = (updatedPlaylist) => {
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
    }
  }

  const removeTrackFromQueue = async (releasePubkey) => {
    const updatedPlaylist = playlist.filter(
      (playlistItem) => playlistItem.releasePubkey !== releasePubkey
    )
    setPlaylist(updatedPlaylist)
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

  const addTrackToQueue = (releasePubkey) => {
    const playlistEntry = createPlaylistEntry(releasePubkey)
    if (playlistEntry) {
      setPlaylist([...playlist, playlistEntry])
      return {
        msg: `${playlistEntry.artist.substring(
          0,
          100
        )} - ${playlistEntry.title.substring(0, 100)} added to queue`,
        variant: 'info',
      }
    }
  }

  const resetQueueWithPlaylist = async (releasePubkeys) => {
    await setPlaylist([])
    const newPlaylist = []
    releasePubkeys.forEach((releasePubkey) => {
      const playlistEntry = createPlaylistEntry(releasePubkey)
      newPlaylist.push(playlistEntry)
    })
    setPlaylist(newPlaylist)
    await setTxid(newPlaylist[0].txid)
    await setIsPlaying(true)
  }

  const createPlaylistEntry = (releasePubkey) => {
    let playlistEntry = undefined
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

    return playlistEntry
  }

  return {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToQueue,
    removeTrackFromQueue,
    resetQueueWithPlaylist,
  }
}
