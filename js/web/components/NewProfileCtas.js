import React from 'react'
import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { styled } from '@mui/system'
import Link from 'next/link'

const NewProfileCtas = ({ activeViewIndex, profilePubkey }) => {
  const renderCtas = (activeViewIndex) => {
    switch (activeViewIndex) {
      case 0:
        return (
          <>
            <Typography my={1}>
              You have not published any Releases yet.
            </Typography>
            <Typography my={1}>
              Create your first Release{' '}
              <Link href="/upload">
                <a>here</a>
              </Link>
              .
            </Typography>
          </>
        )
      case 1:
        return (
          <>
            <Typography my={1}>
              You don&apos;t have any releases in your collection yet.
            </Typography>
            <Typography my={1}>
              Explore some of our favorite Releases{' '}
              <a href="https://hubs.ninaprotocol.com/ninas-picks">here</a> to
              start collecting.
            </Typography>
          </>
        )
      case 2:
        return (
          <>
            <Typography my={1}>You have not created a Hub yet.</Typography>
            <Typography my={1}>
              Click{' '}
              <Link href="/hubs/create">
                <a>here</a>
              </Link>{' '}
              to set up your Hub.
            </Typography>
          </>
        )
      case 3:
        return (
          <>
            <Typography my={1}>
              No one has followed your account yet.
            </Typography>
            <Typography
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${`Check out my profile on Nina%0A`}&url=ninaprotocol.com/${profilePubkey}`,
                  null,
                  'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
                )
              }
              variant=" "
            >
              Share your profile to Twitter.
            </Typography>
          </>
        )
      case 4:
        return (
          <>
            <Typography my={1}>You have not followed any one yet.</Typography>
            <Typography my={1}>
              View your suggestions in the drawer on the right to see relevant
              Hubs and Profiles.
            </Typography>
          </>
        )
    }
  }
  return <CtaWrapper>{renderCtas(activeViewIndex)}</CtaWrapper>
}

export default NewProfileCtas

const CtaWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  a: {
    textDecoration: 'underline',
  },
}))
