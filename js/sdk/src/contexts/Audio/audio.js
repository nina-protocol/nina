import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react'
import Nina from '../Nina'
import Release from '../Release'
import { logEvent } from '../../utils/event'
import axios from 'axios'

const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const { collection, shouldRemainInCollectionAfterSale, ninaClient } =
    useContext(Nina.Context)
  const { releaseState } = useContext(Release.Context)
  const [track, setTrack] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [broadcastChannel, setBroadcastChannel] = useState(null)
  const audioPlayerRef = useRef()
  const activeIndexRef = useRef()
  const playlistRef = useRef()
  const playPrev = (shouldPlay = false) => {
    if (playlist[activeIndexRef.current - 1]) {
      setTrack(playlist[activeIndexRef.current - 1])
      setIsPlaying(shouldPlay)
    }
  }

  const playNext = (shouldPlay = false, hubPublicKey = null) => {
    if (playlistRef.current[activeIndexRef.current + 1]) {
      setTrack(playlistRef.current[activeIndexRef.current + 1])
      if (!hubPublicKey) {
        getRecommendationsForTrackAndAddToPlaylist(
          playlistRef.current[activeIndexRef.current + 1].releasePubkey
        )
      }
      setIsPlaying(shouldPlay)
    } else {
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    playlistRef.current = playlist
    activeIndexRef.current = playlist.indexOf(track) || 0
  }, [track, playlist])

  useEffect(() => {
    var bc = new BroadcastChannel('nina_channel')
    bc.onmessage = function (ev) {
      if (ev.data.type === 'updateTabPlaying') {
        setIsPlaying(false)
      }
    }
    setBroadcastChannel(bc)
  }, [])

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
    activeIndexRef,
    track,
    setInitialized,
    broadcastChannel,
  })

  const updateTrack = (
    releasePubkey,
    shouldPlay = false,
    addToPlaylist = false,
    hubPublicKey = null
  ) => {
    setInitialized(true)

    if (shouldPlay) {
      broadcastChannel.postMessage({ type: 'updateTabPlaying' })
    }

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
    } else {
      setTrack(existingTrack)
    }

    setIsPlaying(shouldPlay)

    if (shouldPlay) {
      const params = {
        publicKey: releasePubkey,
      }
      if (hubPublicKey) {
        params.hub = hubPublicKey
      }

      if (ninaClient.provider.wallet?.connected) {
        params.wallet = ninaClient.provider.wallet.publicKey.toBase58()
      }
      if (!hubPublicKey) {
        getRecommendationsForTrackAndAddToPlaylist(releasePubkey)
      }
      logEvent('track_play', 'engagement', params)
    }
  }

  const getRecommendationsForTrackAndAddToPlaylist = async (
    releasePublicKey
  ) => {
    const recommendationsResponse = await axios.get(
      `https://re.ninaprotocol.com/release/${releasePublicKey}?recommendations=15`
    )
    const releases = recommendationsResponse.data.data.recommendations
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
    const newPlaylist = []
    releases.forEach((release) => {
      if (
        playlist.filter(
          (item) => item.releasePubkey === release.publicKey
        )[0] === undefined
      ) {
        const playlistEntry = createPlaylistEntry(
          release.publicKey,
          release.metadata
        )
        newPlaylist.push(playlistEntry)
      }
    })
    setPlaylist((prevState) =>
      [...prevState, ...newPlaylist].filter(
        (playListItem, index, self) =>
          self.findIndex(
            (playListItem2) =>
              playListItem2.releasePubkey === playListItem.releasePubkey
          ) === index
      )
    )
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        track,
        updateTrack,
        playNext,
        playPrev,
        playlist,
        reorderPlaylist,
        removeTrackFromPlaylist,
        addTrackToQueue,
        removeTrackFromQueue,
        isPlaying,
        setIsPlaying,
        resetQueueWithPlaylist,
        createPlaylistFromTracks,
        createPlaylistFromTracksHubs,
        initialized,
        setInitialized,
        audioPlayerRef,
        activeIndexRef,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

const audioPlayerContextHelper = ({
  tracks,
  releaseState,
  playlist,
  setPlaylist,
  collection,
  shouldRemainInCollectionAfterSale,
  setIsPlaying,
  setTrack,
  track,
  ninaClient,
  setInitialized,
  broadcastChannel,
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
    tracks.forEach((track) => {
      if (
        playlist.filter((item) => item.releasePubkey === track.publicKey)
          .length === 0
      ) {
        const playlistEntry = createPlaylistEntry(track.publicKey)
        if (playlistEntry) {
          playlistEntry.hubHandle = track.hubHandle
          playlistEntry.hubReleaseId = track.hubReleaseId
          playlistEntry.hubPostPubkey = track.hubPostPubkey
          playlistEntries.push(playlistEntry)
        }
      }
    })
    setPlaylist((prevState) => [...prevState, ...playlistEntries])
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
    const params = {
      publicKey: releasePubkey,
    }
    if (ninaClient.provider.wallet?.connected) {
      params.wallet = ninaClient.provider.wallet.publicKey.toBase58()
    }
    logEvent('add_track_to_queue', 'engagement', params)
  }

  const resetQueueWithPlaylist = async (releasePubkeys) => {
    setInitialized(true)
    setPlaylist([])
    const newPlaylist = []
    releasePubkeys.forEach((releasePubkey) => {
      const playlistEntry = createPlaylistEntry(releasePubkey)
      newPlaylist.push(playlistEntry)
    })
    setTrack(newPlaylist[0])
    setPlaylist(newPlaylist)
    broadcastChannel.postMessage({ type: 'updateTabPlaying' })

    setIsPlaying(true)
  }

  const createPlaylistEntry = (releasePubkey, releaseMetadata) => {
    let playlistEntry = undefined

    if (!releaseMetadata) {
      releaseMetadata = releaseState.metadata[releasePubkey]
    }

    if (releaseMetadata) {
      playlistEntry = {
        artist: releaseMetadata.properties.artist,
        title: releaseMetadata.properties.title,
        txid: releaseMetadata.properties.files[0].uri,
        hub: releaseMetadata.publishedThroughHub,
        releasePubkey,
        cover: releaseMetadata.image,
        duration: releaseMetadata.properties.files[0].duration,
        hubHandle: releaseMetadata.hubHandle,
        contentType: releaseMetadata.contentType,
        hubPostPubkey: releaseMetadata.hubPostPubkey,
        hubReleaseId: releaseMetadata.hubReleaseId,
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

export default {
  Context: AudioPlayerContext,
  Provider: AudioPlayerContextProvider,
}
