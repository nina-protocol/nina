import React from 'react'
import { styled } from '@mui/material/styles'
import NinaBox from './NinaBox'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import Link from 'next/link'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'

const HubCreateSuccess = (props) => {
  const router = useRouter()
  const { hubName, hubHandle, inHubs } = props
  const successCopy = inHubs
    ? {
        primary: `/${hubHandle}`,
        secondary: `https://ninaprotocol.com/hubs/${hubHandle}`,
        primaryString: `hubs.ninaprotocol.com/${hubHandle}`,
        secondaryString: `ninaprotocol.com/hubs/${hubHandle}`,
        primaryDescription: `  A customizable page that exclusively surfaces your
                    content.`,
        secondaryDescription: `This is where your Hub can be found on `,
        primaryHyperlink: undefined,
        secondaryHyperlink: `ninaprotocol.com`,
      }
    : {
        primary: `/hubs/${hubHandle}`,
        secondary: `${process.env.NINA_HUBS_URL}/${hubHandle}`,
        primaryString: `ninaprotocol.com/hubs/${hubHandle}`,
        secondaryString: `hubs.ninaprotocol.com/${hubHandle}`,
        primaryDescription: `This is where your Hub can be found on `,
        secondaryDescription: `  A customizable page that exclusively surfaces your
                    content.`,
        primaryHyperlink: `ninaprotocol.com`,
        secondaryHyperlink: undefined,
      }

  const releaseCreateRerouteHandler = (inHubs) => {
    if (inHubs) {
      router.push(`/${hubHandle}/dashboard?action=publishRelease`)
    } else {
      router.push('/upload')
    }
  }
  return (
    <StyledGrid item md={12}>
      <NinaBox>
        <HubSuccessWrapper>
          <Typography variant="h1" sx={{ paddingTop: '16px' }}>
            Your Hub has been created.
          </Typography>
          <Box sx={{ paddingTop: 1 }}>
            <Typography variant="h3" sx={{ paddingBottom: '16px' }}>
              <u>{hubName}</u>
              {` is now available at the following URLs`}
            </Typography>
            <Box sx={{ padding: '16px 0px' }}>
              <Link href={successCopy.primary} passHref>
                <a>
                  <StyledLinkTypography
                    variant="string"
                    sx={{ paddingTop: '8px' }}
                    gutterBottom
                  >
                    {successCopy.primaryString}
                  </StyledLinkTypography>
                </a>
              </Link>
              <Box sx={{ marginBottom: '16px' }}>
                <Typography variant="string">
                  {successCopy.primaryDescription}
                  {successCopy.primaryHyperlink && (
                    <Link href={`https://ninaprotocol.com`}>
                      <StyledLinkTypography
                        sx={{ paddingLeft: '2px' }}
                        variant="string"
                      >
                        <a target="_blank" rel="noopener noreferrer">
                          {successCopy.primaryHyperlink}
                        </a>
                      </StyledLinkTypography>
                    </Link>
                  )}
                </Typography>
              </Box>
              <Link href={successCopy.secondary}>
                <a target="_blank" rel="noopener noreferrer">
                  <StyledLinkTypography
                    sx={{ paddingTop: '8px' }}
                    variant="string"
                    gutterBottom
                  >
                    {successCopy.secondaryString}
                  </StyledLinkTypography>
                </a>
              </Link>
              <Typography
                sx={{ display: 'flex', flexDirection: 'row' }}
                variant="string"
                gutterBottom
              >
                {successCopy.secondaryDescription}
                {successCopy.secondaryHyperlink && (
                  <Link href={`https://ninaprotocol.com`}>
                    <StyledLinkTypography
                      sx={{ paddingLeft: '2px' }}
                      variant="string"
                    >
                      <a target="_blank" rel="noopener noreferrer">
                        {successCopy.secondaryHyperlink}
                      </a>
                    </StyledLinkTypography>
                  </Link>
                )}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => releaseCreateRerouteHandler(inHubs)}
              sx={{ height: '54px', '&:hover': { opacity: '50%' } }}
            >
              Click here to publish your first release.
            </Button>
          </Box>
        </HubSuccessWrapper>
      </NinaBox>
    </StyledGrid>
  )
}
const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '85%',
    },
  },
}))

const HubSuccessWrapper = styled(Box)(() => ({
  width: '100%',

  margin: '0px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',

  maxWidth: '506px',
  textAlign: 'left',
  paddingLeft: '16px',
  paddingRight: '16px',
}))

const StyledLinkTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': {
    opacity: '85%',
  },
}))

export default HubCreateSuccess
