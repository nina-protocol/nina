import React, { createContext, useState, useContext, useEffect } from 'react'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'

export const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const { collection, shouldRemainInCollectionAfterSale, ninaClient } =
    useContext(NinaContext)
  const { provider } = ninaClient
  const { releaseState } = useContext(ReleaseContext)
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

  const currentIndex = () => {
    let index = undefined
    playlist.forEach((item, i) => {
      if (item?.txid === track?.txid) {
        index = i
        return
      }
    })
    return index
  }

  const {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToQueue,
    removeTrackFromQueue,
    resetQueueWithPlaylist,
    createPlaylistFromTracksHubs
  } = audioPlayerContextHelper({
    releaseState,
    collection,
    playlist,
    setPlaylist,
    shouldRemainInCollectionAfterSale,
    setIsPlaying,
    setTrack,
    currentIndex,
  })

  return (
    <AudioPlayerContext.Provider
      value={{
        track,
        updateTrack,
        playNext,
        playPrev,
        updateTrack,
        playlist,
        reorderPlaylist,
        removeTrackFromPlaylist,
        addTrackToQueue,
        removeTrackFromQueue,
        isPlaying,
        setIsPlaying,
        currentIndex,
        resetQueueWithPlaylist,
        createPlaylistFromTracks,
        createPlaylistFromTracksHubs
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
  setIsPlaying,
  currentIndex
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

  const createPlaylistFromTracksHubs = (tracks) => {
    const playlistEntries = []
    tracks.forEach((releasePubkey) => {
      // if (playlist.filter(item => item.releasePubkey === releasePubkey).length === 0) {
        const playlistEntry = createPlaylistEntry(releasePubkey)
        if (playlistEntry) {
          playlistEntries.push(playlistEntry)
        }
      // }
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
    await setTrack(newPlaylist[0])
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
    createPlaylistFromTracksHubs,
  }
}
