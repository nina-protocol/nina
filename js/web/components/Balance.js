import React, { useContext, useEffect, useState, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  Backdrop,
  Fade,
} from '@mui/material'
import { styled } from '@mui/system'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import SwapModal from '@nina-protocol/nina-internal-sdk/esm/SwapModal'
import Divider from '@mui/material/Divider'

const Balance = ({ profilePublishedReleases }) => {
  const { ninaClient, solBalance, usdcBalance } = useContext(Nina.Context)
  const [revenueSumForArtist, setRevenueSumForArtist] = useState(0)
  const [userSolBalance, setUserSolBalance] = useState(0)
  const [userUsdcBalance, setUserUsdcBalance] = useState(0)
  const [open, setOpen] = useState(false)

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

  return (
    <Root>
      <CtaWrapper>
        <Button type="submit" onClick={() => setOpen(true)}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2">Wallet</Typography>
          </Box>
        </Button>
      </CtaWrapper>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Typography
              variant="h4"
              mb={1}
              sx={{ textDecoration: 'underline' }}
              gutterBottom
            >
              Your Balances
            </Typography>
            <Box mb={1} sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ textDecoration: 'underline' }}
              >{`SOL:`}</Typography>
              &nbsp;
              <Typography variant="body1" gutterBottom>
                {userSolBalance}
              </Typography>
            </Box>
            <Box mb={1} sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ textDecoration: 'underline' }}
              >{`USDC:`}</Typography>
              &nbsp;
              <Typography variant="body1" gutterBottom>
                {userUsdcBalance}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ textDecoration: 'underline' }}
              >{`To Collect:`}</Typography>
              &nbsp;
              <Typography variant="body1" gutterBottom>
                {`$${
                  revenueSumForArtist > 0
                    ? ninaClient
                        .nativeToUi(
                          revenueSumForArtist,
                          ninaClient.ids.mints.usdc
                        )
                        .toFixed(2)
                    : '0'
                }`}
              </Typography>
            </Box>
            <Divider sx={{ margin: '15px 0' }} />
            <SwapModal />
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const StyledTypography = styled(Typography)(() => ({
  textTransform: 'uppercase',
  padding: '0px',
  display: 'flex',
  alignItems: 'center',
}))

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

const CtaWrapper = styled(Box)(({ theme }) => ({
  '& button': {
    color: theme.palette.black,
    textDecoration: 'underline',
    borderRadius: '0px',
    // margin: '0 8px',
    [theme.breakpoints.down('md')]: {
      border: 'none',
      margin: '0px',
      padding: '10px 10px 10px 0px',
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
