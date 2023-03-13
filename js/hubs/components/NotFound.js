import React, { useState, useEffect, useContext, useMemo } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'

const NotFound = (props) => {
  let { hub, path } = props
  const [hubHandle, setHubHandle] = useState()
  let hubPubkey
  const { saveHubsToState, getHubContent, hubState } = useContext(Hub.Context)
  const router = useRouter()

  const [revalidationAttempted, setRevalidationAttemped] = useState(false)
  const revalidate = async (path) => {
    await axios.post(
      `${process.env.SERVERLESS_HOST}/api/revalidate?token=${process.env.REVALIDATE_TOKEN}`,
      {
        path,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  useEffect(() => {
    if (!revalidationAttempted) {
      revalidate(path)
      setRevalidationAttemped(true)
    }
  }, [revalidationAttempted, path])

  useEffect(() => {
    if (hub) {
      saveHubsToState([hub])
    }
  }, [hub])

  useEffect(() => {
    if (router.pathname === '/404') {
      try {
        setHubHandle(router.asPath.split('/')[1])
      } catch (error) {
        console.warn(error)
      }
    }
  }, [router.path])

  useEffect(() => {
    if (hubHandle) {
      getHubContent(hubHandle)
    }
  }, [hubHandle])

  const hubData = useMemo(() => {
    const hub = Object.values(hubState).find((hub) => hub.handle === hubHandle)
    return hub
  }, [hubState, hubHandle])

  return (
    <StyledBox>
      <Typography variant="h2" align="left">
        There was a problem loading the Hub.
      </Typography>
      <Typography
        variant="h2"
        align="left"
        sx={{ mt: '15px', color: `palette.blue` }}
      >
        <Link href={path}>Retry?</Link>
      </Typography>

      <Typography variant="h2" align="left" sx={{ mt: '15px' }}>
        <Link href="/all">
          <a>Explore all Hubs</a>
        </Link>
      </Typography>

      {(router.query.hubPostPubkey || router.query.hubReleasePubkey) &&
        (hub || hubData) && (
          <>
            <Typography variant="h2" align="left" sx={{ mt: '15px' }}>
              <Link href={`/${router.query.hubPubkey}`}>
                <a>
                  {`Explore ${
                    hub?.data.displayName || hubData?.data.displayName
                  }`}
                </a>
              </Link>
            </Typography>
          </>
        )}
    </StyledBox>
  )
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexDirection: 'column',
  marginTop: '-125px',
}))

export default NotFound
