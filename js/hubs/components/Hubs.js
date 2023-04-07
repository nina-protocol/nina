import React, { useContext, useEffect, useMemo, useState } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Head from 'next/head'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'

import HubSlider from './HubSlider'
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from '../styles/theme/lightThemeOptions.js'

const Hubs = () => {
  const { getHubsForUser, hubState, filterHubsForUser, hubCollaboratorsState } =
    useContext(Hub.Context)
  const { wallet } = useContext(Wallet.Context)

  useEffect(() => {
    if (wallet.connected) {
      getHubsForUser(wallet.publicKey.toBase58())
    }
  }, [wallet.connected])

  const userHubs = useMemo(() => {
    if (wallet.connected) {
      return filterHubsForUser(wallet.publicKey.toBase58())
    }
    return []
  }, [hubState, wallet.connected, hubCollaboratorsState])

  return (
    <>
      <HubsContainer>
        <Box
          sx={{
            padding: { md: '0px 40px 40px 40px !important', xs: '0px' },
          }}
        >
          {userHubs.length === 0 && (
            <>
              <BlueTypography
                variant="h1"
                align="left"
                sx={{ padding: { md: '40px 165px', xs: '0px 0px 10px' } }}
              >
                <Link href="/all">
                  <a target="_blank">Hubs</a>
                </Link>{' '}
                are a new way to publish, share, and discuss music.{' '}
              </BlueTypography>

              <Box
                sx={{ display: 'flex', paddingLeft: { md: '30px', xs: '0' } }}
              >
                <Typography
                  variant="body1"
                  align="left"
                  className={classes.sectionHeader}
                >
                  <Link href="/all" sx={{ textDecoration: 'none' }}>
                    <a>Featured Hubs</a>
                  </Link>
                </Typography>
              </Box>
              <HubSlider />
              <DashboardContent item mt={4} md={12}>
                <StyledLink href="/create">
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    type="submit"
                  >
                    Create a Hub
                  </Button>
                </StyledLink>
                <StyledLink href="/all">
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    type="submit"
                    sx={{ mt: '15px' }}
                  >
                    Browse All Hubs
                  </Button>
                </StyledLink>
              </DashboardContent>

            </>
          )}
          <>
            {userHubs?.length > 0 && (
              <DashboardWrapper
                md={9}
                columnSpacing={2}
                columnGap={2}
                height="100% !important"
              >
                <DashboardContent item md={6}>
                  <StyledLink href="/create">
                    <Button
                      color="primary"
                      variant="outlined"
                      fullWidth
                      type="submit"
                    >
                      Create a Hub
                    </Button>
                  </StyledLink>
                  <StyledLink href="/all">
                    <Button
                      color="primary"
                      variant="outlined"
                      fullWidth
                      type="submit"
                      sx={{ mt: '15px' }}
                    >
                      Browse All Hubs
                    </Button>
                  </StyledLink>
                </DashboardContent>

                <DashboardContent item md={6}>
                  <>
                    <DashboardHeader style={{ fontWeight: 600 }}>
                      You have {userHubs.length}{' '}
                      {userHubs.length > 1 ? 'Hubs' : 'Hub'}
                    </DashboardHeader>
                    <ul style={{ height: '500px', overflowY: 'scroll' }}>
                      {userHubs
                        .filter((hub) => hub.publicKey)
                        .map((hub) => {
                          return (
                            <DashboardEntry key={hub.publicKey}>
                              <Link href={`/${hub.handle}`}>
                                <a>{hub?.data?.displayName}</a>
                              </Link>
                            </DashboardEntry>
                          )
                        })}
                    </ul>
                  </>
                </DashboardContent>
              </DashboardWrapper>
            )}
          </>
        </Box>
      </HubsContainer>
    </>
  )
}

const PREFIX = 'hubs'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': {
    color: theme.palette.blue,
    textDecoration: 'none',
  },
}))

const StyledLink = styled(Link)(() => ({
  textDecoration: 'none',
}))
const HubsContainer = styled('div')(({ theme }) => ({
  width: '1010px',
  margin: 'auto',
  overflowX: 'visible',
  [theme.breakpoints.down('md')]: {
    width: '80vw',
    overflowY: 'hidden',
    marginTop: '6vh',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 !important',
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: 'uppercase !important',
    position: 'relative',
    '& .MuiTypography-root': {
      textTransform: 'uppercase !important',
      fontWeight: '700 !important',
    },
    '& .MuiButton-root': {
      position: 'absolute',
      top: '-10px',
    },
  },
}))

export default Hubs
