import React, { useState, useContext, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import nina from '@nina-protocol/nina-sdk'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Dots from './Dots'
import Image from 'next/image'
import {useSnackbar} from 'notistack'


import { useWallet } from '@solana/wallet-adapter-react'
const ContentTileView = dynamic(() => import('./ContentTileView'))
const { HubContext, NinaContext, ReleaseContext } = nina.contexts

const UserReleasesPrompt = ({hubPubkey}) => {
  const {collection} = useContext(NinaContext)
  const {releaseState, getReleasesPublishedByUser, filterReleasesPublishedByUser } = useContext(ReleaseContext)
  const wallet = useWallet()
  const {enqueueSnackbar} = useSnackbar()
  const [userPublishedReleases, setUserPublishedReleases] = useState([])


  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser(wallet.publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser())
    }
  }, [releaseState, collection])

  const handleRepost = async (release) => {
    enqueueSnackbar(`Adding ${release.metadata.name} to Hub`, {
      variant: 'info',
    })
    const result = await hubAddRelease(selectedHubId, release.releasePubkey)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
    } else {
      enqueueSnackbar('Release not added to hub', {
        variant: 'failure',
      })
    }
  }

  return (
    <Wrapper container spacing={1}>
      {userPublishedReleases.map(release => {
        // console.log('release :>> ', release);
        return (
          <Grid item md={6}>
            <Image
              width={100}
              height={100}
              layout="responsive"
              src={release.metadata.image}
              priority={true}
              unoptimized={true}
              loading="eager"
              onClick={() => handleRepost(release)}
            />
          </Grid>
        )
      })}
      <Typography>
        I AM THE PROMPT
      </Typography>
    </Wrapper>
  )
}


const Wrapper = styled(Grid)(({theme}) => ({
  border: '2px solid red',
}))



export default UserReleasesPrompt
