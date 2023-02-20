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
    <Box sx={{ display: 'flex',}}>
      <BalanceWrapper balance={true}>
        <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
          Balances
        </Typography>
      </BalanceWrapper>
      <BalanceWrapper>
        <Typography variant="body2">
          {`sol: ${ninaClient
            .nativeToUi(solBalance, ninaClient.ids.mints.wsol)
            .toFixed(2)}`}
        </Typography>
      </BalanceWrapper>
      <BalanceWrapper>
        <Typography variant="body2">{`usdc: $${usdcBalance}`}</Typography>
      </BalanceWrapper>
      {revenueSumForArtist > 0 && (
        <BalanceWrapper>
          <Typography variant="body2">{`revenue owed: $${ninaClient
            .nativeToUi(revenueSumForArtist, ninaClient.ids.mints.usdc)
            .toFixed(2)}`}</Typography>
        </BalanceWrapper>
      )}
    </Box>
  )
}
const BalanceWrapper = styled(Box)(({ theme, balance }) => ({
  '& p': {
    color: 'black',
    textTransform: 'uppercase',
    borderRadius: '0px',
    margin: balance ? '0px 8px 0px 204px' : '0 8px',
    padding: '0px 0px 8px 0px',
    display: 'flex',
    alignItems: 'center',
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
