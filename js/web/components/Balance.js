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
      <Box sx={{ marginLeft: '100px' }}>
        <StyledTypography variant="body2" sx={{ textDecoration: 'underline' }}>
          Balances
        </StyledTypography>
      </Box>
      <StyledBox>
        <StyledTypography variant="body2">{`sol: `}</StyledTypography>
        <StyledTypography variant="body2">{`${userSolBalance}`}</StyledTypography>
      </StyledBox>
      <StyledBox>
        <StyledTypography variant="body2">{`usdc: `}</StyledTypography>
        <StyledTypography variant="body2">{`$${userUsdcBalance}`}</StyledTypography>
      </StyledBox>
      {revenueSumForArtist > 0 && (
        <StyledBox>
          <StyledTypography
            variant="body2"
            noWrap
          >{`to collect: `}</StyledTypography>
          <StyledTypography variant="body2">
            {`$${ninaClient
              .nativeToUi(revenueSumForArtist, ninaClient.ids.mints.usdc)
              .toFixed(2)}`}
          </StyledTypography>
        </StyledBox>
      )}
      <StyledBox>
        <SwapModal refreshBalances={refreshBalances} inProfile={true} />
      </StyledBox>
    </Box>
  )
}

const StyledTypography = styled(Typography)(() => ({
  textTransform: 'uppercase',
  padding: '0px',
  display: 'flex',
  alignItems: 'center',
}))

const StyledBox = styled(Box)(() => ({
  marginLeft: '30px',
}))

export default Balance
