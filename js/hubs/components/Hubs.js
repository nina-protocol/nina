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
  const { npcAmountHeld } = useContext(Nina.Context)
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
          {!wallet?.connected && (
            <>
              <BlueTypography
                variant="h1"
                align="left"
                sx={{ padding: { md: '40px 165px', xs: '0px 0px 10px' } }}
              >
                <Link href="/all">
                  <a>Hubs</a>
                </Link>{' '}
                are a new way to publish, share, and discuss music.
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
              <Box
                align="center"
                sx={{
                  paddingBottom: { md: '40px', xs: '30px' },
                  paddingTop: { md: '80px', xs: '30px' },
                }}
              >
                <BlueTypography variant="h1" align="center">
                  <a
                    href="https://www.notion.so/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612#c7abd525851545a199e06ecd14a16a15"
                    target="_blank"
                    rel="noreferrer"
                    passHref
                  >
                    Learn More
                  </a>{' '}
                  or <EmailCapture size="large" />
                </BlueTypography>
              </Box>
            </>
          )}
          {wallet.connected && (
            <>
              {npcAmountHeld === 0 && userHubs && userHubs?.length === 0 && (
                <DashboardContent>
                  <BlueTypography
                    variant="h1"
                    align="left"
                    sx={{ padding: { md: '0 165px 40px', xs: '30px 0px' } }}
                  >
                    You do not have any credits to create a Hub.{'  '}
                    <EmailCapture size="large" />.
                  </BlueTypography>

                  <Box
                    sx={{
                      display: 'flex',
                      paddingLeft: { md: '30px', xs: '0' },
                    }}
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
                </DashboardContent>
              )}
              {userHubs?.length === 0 && npcAmountHeld > 0 && (
                <DashboardContent item md={12}>
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
              )}
              {userHubs?.length > 0 && (
                <DashboardWrapper
                  md={9}
                  columnSpacing={2}
                  columnGap={2}
                  height="100% !important"
                >
                  {npcAmountHeld === 0 && (
                    <DashboardContent item md={6}>
                      <StyledLink
                        href="https://docs.google.com/forms/d/e/1FAIpQLScSdwCMqUz6VGqhkO6xdfUxu1pzdZEdsGoXL9TGDYIGa9t2ig/viewform"
                        target="_blank"
                        rel="noreferrer"
                        passHref
                      >
                        <Button
                          color="primary"
                          variant="outlined"
                          fullWidth
                          type="submit"
                        >
                          Apply For More Hubs
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
                  )}
                  {npcAmountHeld > 0 && (
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
                  )}
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
          )}
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
