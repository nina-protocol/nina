import React from 'react';
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Link from 'next/link'

const NewProfileCtas = ({activeViewIndex}) => {
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
                <a>
                  here 
                </a>
              </Link>
              .
            </Typography>
          </>
            
        )
      case 1:
        return (
          <>
            <Typography my={1}>You don't have any releases in your collection yet.</Typography>
            <Typography my={1}>
              Explore some of our favorite Releases {' '}<a href="https://hubs.ninaprotocol.com/ninas-picks">here</a> to start collecting.
            </Typography>
          </>
        )
      case 2:
        return (
          <>
            <Typography my={1}>You have not created a Hub yet.</Typography>
              <Typography my={1}>
              Click{' '}
              <Link href="/upload">
                <a>
                  here 
                </a>
              </Link>
              {' '}to set up your Hub.
            </Typography>
          </>
        )
      case 3:
        return (
          <>
            <Typography my={1}>No one has followed your account yet.</Typography>
            <Typography>Share your profile to twitter</Typography>
          </>
        )
        case 4:
          return (
          <>
            <Typography my={1}>You have not followed any one yet.</Typography>
            <Typography my={1}>View your suggestions in the drawer on the right to see relevant Hubs and Profiles.</Typography>
          </>
        )
    }
  }
  return(
    <CtaWrapper>
      {renderCtas(activeViewIndex)}
    </CtaWrapper>
  )
};

export default NewProfileCtas;

const CtaWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  'a': {
    textDecoration: 'underline',
  }
}))
