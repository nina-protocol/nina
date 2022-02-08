import React, { useState, useContext, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Typography from '@mui/material/Typography'
import nina from '@ninaprotocol/nina-sdk'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Link from 'next/link'
import HubAddArtist from './HubAddArtist'

const { HubContext } = nina.contexts

const Hub = ({ hubPubkey }) => {
  const wallet = useWallet()
  const {
    getHub,
    hubState,
    hubArtistsState,
    hubReleasesState,
    filterHubArtistsByHub,
    filterHubReleasesByHub,
  } = useContext(HubContext)

  const [hubData, setHubData] = useState(hubState[hubPubkey])
  const [hubArtists, setHubArtists] = useState(hubArtistsState[hubPubkey])
  const [hubReleases, setHubReleases] = useState(hubReleasesState[hubPubkey])
  const [userIsCurator, setUserIsCurator] = useState(false)

  useEffect(() => {
    getHub(hubPubkey)
  }, [hubPubkey])

  useEffect(() => {
    setHubData(hubState[hubPubkey])
  }, [hubState[hubPubkey]])

  useEffect(() => {
    setHubArtists(filterHubArtistsByHub(hubPubkey))
  }, [hubArtistsState])

  useEffect(() => {
    setHubReleases(filterHubReleasesByHub(hubPubkey))
  }, [hubReleasesState])

  useEffect(() => {
    if (wallet.connected) {
      if (wallet?.publicKey?.toBase58() === hubData?.curator) {
        setUserIsCurator(true)
      }
    }
  }, [hubData, wallet?.connected])

  return (
    <HubWrapper>
      {hubData && (
        <>
          <h1>{hubData.name}</h1>
          {/* {JSON.stringify(hubData, null, 2)}  */}
        </>
      )}

      {userIsCurator && (
        <>
          <Typography>Welcome you your Hub</Typography>

          <Box>
            <Link href={`/hubs/${hubPubkey}/upload`}>
              Upload a track through your Hub
            </Link>
          </Box>

          <Box width="40%">
            <Typography>add an artist to your hub</Typography>

            <HubAddArtist hubPubkey={hubPubkey} />
          </Box>
        </>
      )}

      {hubArtists && Object.keys(hubArtists).length > 0 && (
        <Box>
          There are {Object.keys(hubArtists).length} artists associated with
          this hub:
          <ul>
            {Object.keys(hubArtists).map((artistPubkey) => {
              const hubArtist = hubArtists[artistPubkey]
              return <li key={hubArtist.artist}>{hubArtist.artist}</li>
            })}
          </ul>
        </Box>
      )}
      {hubReleases && Object.keys(hubReleases).length > 0 && (
        <Box>
          There are {Object.keys(hubReleases).length} releases associated with
          this hub:
          <ul>
            {Object.keys(hubReleases).map((releasePubkey) => {
              const hubRelease = hubReleases[releasePubkey]
              return <li key={hubRelease.release}>{hubRelease.release}</li>
            })}
          </ul>
        </Box>
      )}
    </HubWrapper>
  )
}

const HubWrapper = styled(Box)(() => ({
  border: '2px solid red',
  width: '80vw',
}))

export default Hub
