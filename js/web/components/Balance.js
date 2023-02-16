import React, { useContext,  } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

const Balance = () => {
  const { ninaClient, solBalance, usdcBalance } = useContext(
    Nina.Context
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CtaWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
            Balances
          </Typography>
        </Box>
      </CtaWrapper>
      <CtaWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2">
            {`sol: ${ninaClient.nativeToUi(
              solBalance,
              ninaClient.ids.mints.wsol
            )}`}
            {` / usdc: $${usdcBalance}`}
          </Typography>
        </Box>
      </CtaWrapper>
      <CtaWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2"></Typography>
        </Box>
      </CtaWrapper>
    </Box>
  )
}
const CtaWrapper = styled(Box)(({ theme }) => ({
  '& p': {
    color: 'black',
    textTransform: 'uppercase',
    borderRadius: '0px',
    margin: '0 8px',
    padding: '5px',
    [theme.breakpoints.down('md')]: {
      border: 'none',
      margin: '0px',
      padding: '5px 5px 5px 0px',
      '& p': {
        display: 'none',
      },
    },
    '& svg': {
      fontSize: '16px',
      [theme.breakpoints.down('md')]: {
        fontSize: '20px',
      },
    },
  },
}))
export default Balance
