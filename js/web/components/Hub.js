import React, { useState, useContext, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Typography from '@mui/material/Typography'
import ninaCommon from 'nina-common'

import Box from '@mui/material/Box'
import Link from 'next/link'

import { styled } from '@mui/material/styles'

import HubAddArtist from "./HubAddArtist";

import { useRouter } from 'next/router'

const { HubContext } = ninaCommon.contexts

const Hub = () => {
  const router = useRouter()
  const hubPubkey = router.query.hubPubkey
  const wallet = useWallet()
  const { getHub, hubState, hubArtistsState, hubReleasesState, getHubArtists, getHubReleases } = useContext(HubContext)

  const [hubData, setHubData] = useState(hubState[hubPubkey])
  const [hubArtists, setHubArtists] = useState(hubArtistsState[hubPubkey])
  const [hubReleases, setHubReleases] = useState(hubReleasesState[hubPubkey])
  const [userIsCurator, setUserIsCurator] = useState(false)

  useEffect(() => {
    if (!hubData) {
      getHub(hubPubkey)
    }
  }, [])

  useEffect(() => {
    setHubData(hubState[hubPubkey])
  }, [hubState[hubPubkey]])

  useEffect(() => {
    console.log('hubArtistsState :>> ', hubArtistsState[hubPubkey]);
    setHubArtists(hubArtistsState[hubPubkey])
  }, [hubArtistsState[hubPubkey]])

  useEffect(() => {
    console.log('hubReleasesState :>> ', hubReleasesState[hubPubkey]);
    setHubReleases(hubReleasesState[hubPubkey])
  }, [hubReleasesState[hubPubkey]])

  useEffect(() => {
    if (!hubArtistsState[hubPubkey] && hubPubkey) {
      getHubArtists(hubPubkey)
    }
  }, [hubArtistsState[hubPubkey]])

  useEffect(() => {
    if (!hubReleasesState[hubPubkey] && hubPubkey) {
      getHubReleases(hubPubkey)
    }
  }, [hubReleasesState[hubPubkey]])

  useEffect(() => {
    if (wallet.connected) {
      if (
        wallet?.publicKey?.toBase58() === hubData?.curator.toBase58()
      ) {
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
            <Typography>
                add an artist to your hub
            </Typography>

            <HubAddArtist hubPubkey={hubPubkey} />
          </Box>
        </>
      )}

      {hubArtists && Object.keys(hubArtists).length > 0 &&
        <Box>
            There are {Object.keys(hubArtists).length} artists associated with this hub:
            <ul>
            {Object.keys(hubArtists).map(artistPubkey => {
              const hubArtist = hubArtists[artistPubkey]
              return <li>{hubArtist.artist.toBase58()}</li>
            }) }
            </ul>
        </Box>
      }
      {hubReleases && Object.keys(hubReleases).length > 0 &&
        <Box>
          There are {Object.keys(hubReleases).length} releases associated with this hub:
          <ul>
            {Object.keys(hubReleases).map(releasePubkey => {
              console.log('releasePubkey :>> ', releasePubkey);
              const hubRelease = hubReleases[releasePubkey]
              return <li>{hubRelease.release.toBase58()}</li>
            })}
          </ul>
        </Box>
      }
    </HubWrapper>
  )
}

const HubWrapper = styled(Box)(() => ({
  border: '2px solid red',
  width: '80vw',
}))

export default Hub
