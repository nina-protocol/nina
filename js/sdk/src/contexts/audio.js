import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'

export const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const { collection, shouldRemainInCollectionAfterSale, ninaClient } =
    useContext(NinaContext)
  const { releaseState } = useContext(ReleaseContext)
  const [track, setTrack] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const audioPlayerRef = useRef();
  
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

  const currentIndex = () => {
    let index = undefined
    if (playlist.length > 0) {
      playlist.forEach((item, i) => {
        if (item.releasePubkey === track?.releasePubkey) {
          index = i
          return
        }
      })
    } else {
      index = 0
    }
    return index
  }

  const {
    reorderPlaylist,
    removeTrackFromPlaylist,
    createPlaylistFromTracks,
    addTrackToQueue,
    removeTrackFromQueue,
    resetQueueWithPlaylist,
    createPlaylistFromTracksHubs,
    createPlaylistEntry,
  } = audioPlayerContextHelper({
    releaseState,
    collection,
    playlist,
    setPlaylist,
    shouldRemainInCollectionAfterSale,
    setIsPlaying,
    setTrack,
    currentIndex,
    setTrack,
    track,
  })

  const updateTrack = (
    releasePubkey,
    shouldPlay = false,
    addToPlaylist = false
  ) => {
    const existingTrack = playlist.filter(
      (item) => item.releasePubkey === releasePubkey
    )[0]
    if (
      (addToPlaylist && playlist.length === 0) ||
      (addToPlaylist && !existingTrack)
    ) {
      const updatedPlaylist = [...playlist]
      const item = createPlaylistEntry(releasePubkey)
      updatedPlaylist.push(item)
      setPlaylist(updatedPlaylist)
      setTrack(item)
    } else if (existingTrack) {
      setTrack(existingTrack)
    }
    setIsPlaying(shouldPlay)
  }

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
        createPlaylistFromTracksHubs,
        initialized,
        setInitialized,
        audioPlayerRef,
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
  currentIndex,
  setTrack,
  track,
}) => {
  const reorderPlaylist = (updatedPlaylist) => {
    setPlaylist([...updatedPlaylist])
    if (updatedPlaylist.length === 0) {
      setIsPlaying(false)
    }
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
    const index = playlist.indexOf(track)
    const deletingCurrentTrack = track.releasePubkey === releasePubkey
    const updatedPlaylist = playlist.filter(
      (playlistItem) => playlistItem.releasePubkey !== releasePubkey
    )
    setPlaylist(updatedPlaylist)
    if (updatedPlaylist.length === 0) {
      setIsPlaying(false)
      setTrack()
    } else if (deletingCurrentTrack) {
      if (updatedPlaylist.length >= index + 1) {
        setTrack(updatedPlaylist[index])
      } else {
        setTrack(updatedPlaylist[index - 1])
      }
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

  const createPlaylistFromTracksHubs = (tracks) => {
    const playlistEntries = []
    tracks.forEach((releasePubkey) => {
      if (
        playlist.filter((item) => item.releasePubkey === releasePubkey)
          .length === 0
      ) {
        const playlistEntry = createPlaylistEntry(releasePubkey)
        if (playlistEntry) {
          playlistEntries.push(playlistEntry)
        }
      }
    })
    setPlaylist([...playlist, ...playlistEntries])
  }

  const addTrackToQueue = (releasePubkey) => {
    if (
      playlist.filter((item) => item.releasePubkey === releasePubkey)[0] ===
      undefined
    ) {
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
  }

  const resetQueueWithPlaylist = async (releasePubkeys) => {
    setPlaylist([])
    const newPlaylist = []
    releasePubkeys.forEach((releasePubkey) => {
      const playlistEntry = createPlaylistEntry(releasePubkey)
      newPlaylist.push(playlistEntry)
    })
    setTrack(newPlaylist[0])
    setPlaylist(newPlaylist)
    setIsPlaying(true)
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
    createPlaylistEntry,
  }
}
