import React from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
const LowSolWarning = ({ requiredSol, formattedSolBalance }) => {
  return (
    <LowSolBox>
      <Typography variant="h5" component="h2" sx={{ paddingBottom: '16px' }}>
        You do not have enough SOL in your wallet to publish a Release
      </Typography>
      <ModalTypography variant="h3" component="p" gutterBottom>
        {`${requiredSol} SOL is required to publish a Release.`}
      </ModalTypography>
      <ModalTypography variant="h3" component="p" gutterBottom>
        {`You currently have ${formattedSolBalance}
            SOL in your wallet.`}
      </ModalTypography>
      <ModalTypography
        variant="h3"
        component="p"
        gutterBottom
        sx={{ display: 'flex', flexDirection: 'row' }}
      >
        {`For any questions, please reach out to us at `}
        <Link href="mailto:contact@ninaprotocol.com">
          <a target="_blank" rel="noreferrer">
            <ContactTypography
              variant="h3"
              component="p"
              sx={{ marginLeft: '4px' }}
            >
              {`contact@ninaprotocol.com`}
            </ContactTypography>
          </a>
        </Link>
        .
      </ModalTypography>
    </LowSolBox>
  )
}

const LowSolBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 4, 3),
  width: '50vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  textAlign: 'left',
}))

const ModalTypography = styled(Typography)(() => ({
  marginBottom: '8px',
}))

const ContactTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  marginTop: '0px',
  marginBottom: '0px',
}))

export default LowSolWarning
