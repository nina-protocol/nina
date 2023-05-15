import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
const LowSolWarning = ({ requiredSol, formattedSolBalance, action }) => {
  const [actionText, setActionText] = useState('')
  useEffect(() => {
    switch (action) {
      case 'publish':
        return setActionText('upload a Release')
      case 'hub':
        return setActionText('create a Hub')
      default:
        break
    }
  }, [action, actionText])
  return (
    <LowSolBox>
      <Typography variant="h5" component="h2" sx={{ paddingBottom: '16px' }}>
        {` You do not have enough SOL in your wallet to ${actionText}.`}
      </Typography>
      <ModalTypography variant="h3" component="p" gutterBottom>
        {`${requiredSol} SOL is required to upload a Release.`}
      </ModalTypography>
      <ModalTypography variant="h3" component="p" gutterBottom>
        {`You currently have ${formattedSolBalance}
            SOL in your wallet.`}
      </ModalTypography>
      <ModalTypography variant="h3" component="p" gutterBottom>
        {`Please add more SOL to your wallet to ${actionText}.`}
      </ModalTypography>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <ModalTypography variant="h3" component="p" gutterBottom>
          {`For any questions, please reach out to us at `}
        </ModalTypography>
        <Link href="mailto:contact@ninaprotocol.com">
          <a
            target="_blank"
            rel="noreferrer"
            style={{ margin: '0px', textDecoration: 'none' }}
          >
            <ContactTypography variant="h3" component="p">
              {`contact@ninaprotocol.com`}
            </ContactTypography>
          </a>
        </Link>
        <ModalTypography variant="h3" component="p" gutterBottom>
          {`.`}
        </ModalTypography>
      </Box>
    </LowSolBox>
  )
}

const LowSolBox = styled(Box)(() => ({
  margin: '0px auto',
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
  marginLeft: '6px',
  textDecoration: 'none',
}))

export default LowSolWarning
