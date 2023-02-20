import React, { useContext, useEffect, useState } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'

const Balance = ({ profilePublishedReleases }) => {
  const { ninaClient, solBalance, usdcBalance } = useContext(Nina.Context)
  const [revenueSumForArtist, setRevenueSumForArtist] = useState(0)

  useEffect(() => {
    fetchRevenueSumForArtist()
  }, [profilePublishedReleases, revenueSumForArtist])

  const fetchRevenueSumForArtist = () => {
    let revenueSum = 0
    profilePublishedReleases?.forEach((release) => {
      revenueSum += release.recipient.owed
    })
    setRevenueSumForArtist(revenueSum)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <BalanceWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
            Balances
          </Typography>
        </Box>
      </BalanceWrapper>
      <BalanceWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2">
            {`sol: ${ninaClient
              .nativeToUi(solBalance, ninaClient.ids.mints.wsol)
              .toFixed(2)}`}
          </Typography>
        </Box>
      </BalanceWrapper>
      <BalanceWrapper>
        <Box display="flex" alignItems="center">
          <Typography variant="body2">{`usdc: $${usdcBalance}`}</Typography>
        </Box>
      </BalanceWrapper>
      {revenueSumForArtist > 0 && (
        <BalanceWrapper>
          <Box display="flex" alignItems="center">
            <Typography variant="body2">{`revenue owed: $${ninaClient
              .nativeToUi(revenueSumForArtist, ninaClient.ids.mints.usdc)
              .toFixed(2)}`}</Typography>
          </Box>
        </BalanceWrapper>
      )}
    </Box>
  )
}
const BalanceWrapper = styled(Box)(({ theme }) => ({
  '& p': {
    color: 'black',
    textTransform: 'uppercase',
    borderRadius: '0px',
    margin: '0 8px',
    padding: '0px 0px 8px 0px',
    [theme.breakpoints.down('md')]: {
      border: 'none',
      margin: '0px',
      padding: '5px 5px 5px 0px',
      '& p': {
        display: 'none',
      },
    },
  },
}))

export default Balance
