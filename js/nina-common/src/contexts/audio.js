import { createContext, useState, useContext, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ConnectionContext } from './connection'
import { NinaContext } from './nina'
import { ReleaseContext } from './release'
import {useSnackbar} from 'notistack';


import NinaClient from '../utils/client'

export const AudioPlayerContext = createContext()
const AudioPlayerContextProvider = ({ children }) => {
  const wallet = useWallet()
  const { collection, shouldRemainInCollectionAfterSale } =
    useContext(NinaContext)
  const {enqueueSnackbar} = useSnackbar();

  const { releaseState } = useContext(ReleaseContext)
  const { connection } = useContext(ConnectionContext)
  const [txid, setTxid] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

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
    addTrackToQue,
    removeTrackFromQue
  } = audioPlayerContextHelper({
    releaseState,
    wallet,
    connection,
    collection,
    playlist,
    setPlaylist,
    shouldRemainInCollectionAfterSale,
    enqueueSnackbar
  })

  const updateTxid = (newTxid, releasePubkey) => {
    if (newTxid !== playlist[currentIndex()]) {
      addTrackToQue(releasePubkey)
      setTxid(newTxid)
    }
  }

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
        txid,
        updateTxid,
        playlist,
        reorderPlaylist,
        removeTrackFromPlaylist,
        addTrackToQue,
        removeTrackFromQue
        isPlaying,
        setIsPlaying,
        currentIndex
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
  enqueueSnackbar
}) => {
  const reorderPlaylist = (updatedPlaylist) => {
    setPlaylist([...updatedPlaylist])
  }

  const removeTrackFromPlaylist = async (releasePubkey) => {
    console.log('remove!');
    const remain = await shouldRemainInCollectionAfterSale(
      releasePubkey,
      releaseState.releaseMintMap[releasePubkey]
    )
    if (!remain) {
      const updatedPlaylist = playlist.filter(
        (playlistItem) => playlistItem.releasePubkey !== releasePubkey
      )

      const updatedTracks = { ...tracks }
      console.log('tracks :>> ', updatedTracks);
      delete updatedTracks[releasePubkey]
      console.log('updatedPlaylist :>> ', updatedPlaylist);
      setPlaylist(updatedPlaylist)
      // setTracks(updatedTracks)
    }
  }
  
  const removeTrackFromQue = async (releasePubkey) => {
    console.log('remove from que!');

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

  const addTrackToQue = (releasePubkey) => {
    const playlistEntry = createPlaylistEntry(releasePubkey)
    if (playlistEntry) {
      setPlaylist([...playlist, playlistEntry])
      enqueueSnackbar(`${playlistEntry.artist} - ${playlistEntry.title} added to que`, {
        variant: 'info',
      })
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
    addTrackToQue,
    removeTrackFromQue
  }
}
