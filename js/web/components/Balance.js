import React, { useContext, useEffect, useState } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import SwapModal from '@nina-protocol/nina-internal-sdk/esm/SwapModal'
const Balance = ({ profilePublishedReleases }) => {
  const { ninaClient, solBalance, usdcBalance, getUserBalances } = useContext(
    Nina.Context
  )
  const [revenueSumForArtist, setRevenueSumForArtist] = useState(0)
  const [userSolBalance, setUserSolBalance] = useState(0)
  const [userUsdcBalance, setUserUsdcBalance] = useState(0)

  useEffect(() => {
    fetchRevenueSumForArtist()
  }, [profilePublishedReleases, revenueSumForArtist])

  useEffect(() => {
    setUserSolBalance(
      ninaClient.nativeToUi(solBalance, ninaClient.ids.mints.wsol).toFixed(4)
    )
  }, [solBalance])

  useEffect(() => {
    setUserUsdcBalance(usdcBalance)
  }, [usdcBalance])

  const fetchRevenueSumForArtist = () => {
    let revenueSum = 0
    profilePublishedReleases?.forEach((release) => {
      revenueSum += release.recipient.owed
    })
    setRevenueSumForArtist(revenueSum)
  }

  const refreshBalances = async () => {
    const yo = await getUserBalances()
    setUserSolBalance(sol)
    setUserUsdcBalance(usdc)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
      <BalanceWrapper balance={true}>
        <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
          Balances
        </Typography>
      </BalanceWrapper>
      <BalanceWrapper>
        <Typography variant="body2">{`sol: `}</Typography>
        <Typography variant="body2">{`${userSolBalance}`}</Typography>
      </BalanceWrapper>
      <BalanceWrapper>
        <Typography variant="body2">{`usdc: `}</Typography>
        <Typography variant="body2">{`$${userUsdcBalance}`}</Typography>
      </BalanceWrapper>
      {revenueSumForArtist > 0 && (
        <BalanceWrapper>
          <Typography variant="body2" noWrap>{`revenue owed: `}</Typography>
          <Typography variant="body2">
            {`$${ninaClient
              .nativeToUi(revenueSumForArtist, ninaClient.ids.mints.usdc)
              .toFixed(2)}`}
          </Typography>
        </BalanceWrapper>
      )}
      <SwapModal refreshBalances={refreshBalances} inProfile={true} />
    </Box>
  )
}
const BalanceWrapper = styled(Box)(({ theme, balance }) => ({
  '& p': {
    color: 'black',
    textTransform: 'uppercase',
    borderRadius: '0px',
    margin: balance ? '0px 8px 0px 204px' : '0 16px',
    padding: '0px',
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
