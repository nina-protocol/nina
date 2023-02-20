import React, { useState, useEffect, useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Nina from '../contexts/Nina'
import { useSnackbar } from 'notistack'
import Dots from './Dots'

const BundlrModalBody = ({ open, setOpen, notEnoughSol, uploadSize }) => {
  const { enqueueSnackbar } = useSnackbar()
  const {
    bundlrBalance,
    getBundlrBalance,
    bundlrFund,
    bundlrWithdraw,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    initBundlr,
  } = useContext(Nina.Context)
  const [amount, setAmount] = useState(0.05)
  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  )
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )
  const [mode, setMode] = useState('deposit')
  const [inProgress, setInProgress] = useState(false)

  useEffect(() => {
    initBundlr()
  }, [])

  useEffect(() => {
    getBundlrPricePerMb()
    getBundlrBalance()
    getSolPrice()
  }, [getBundlrBalance, getBundlrPricePerMb, getSolPrice])

  const handleFund = async (fundAmount) => {
    setInProgress(true)
    const result = await bundlrFund(fundAmount)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
      setOpen(false)
    } else {
      enqueueSnackbar('Account not funded', {
        variant: 'failure',
      })
    }
    setAmount('')
    setInProgress(false)
  }

  const handleWithdraw = async (withdrawAmount) => {
    setInProgress(true)
    const result = await bundlrWithdraw(withdrawAmount)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
      setOpen(false)
    } else {
      enqueueSnackbar('Withdrawl not completed', {
        variant: 'failure',
      })
    }
    setAmount('')
    setInProgress(false)
  }

  const handleToggleMode = () => {
    setMode(mode === 'deposit' ? 'withdraw' : 'deposit')
  }
  return (
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
            align="center"
            variant="h4"
            id="transition-modal-title"
            gutterBottom
          >
            {notEnoughSol
              ? `You do not have space in your Upload Account to publish this release`
              : `Fund your Upload Account`}
          </Typography>

          {notEnoughSol ? (
            <>
              <Typography sx={{ paddingBottom: '8px', paddingTop: '16px' }}>
                This release is {uploadSize} MBs.
              </Typography>
              <Typography sx={{ paddingBottom: '8px' }}>
                You have {mbs?.toFixed(2)} MBs available in your Upload Account.
              </Typography>
              <Typography sx={{ paddingBottom: '8px' }}>
                Top up your Upload Account to publish this release.
              </Typography>
              <Typography sx={{ paddingBottom: '16px' }}>
                Upload Account Balance: {bundlrBalance?.toFixed(4)} SOL ($
                {bundlrUsdBalance.toFixed(2)})
              </Typography>
            </>
          ) : (
            <>
              <Typography align="left" variant="subtitle1">
                Here you can deposit SOL to your upload account to cover the
                storage costs of your Nina releases.
              </Typography>
              <Typography align="left" variant="subtitle1" gutterBottom>
                A one time fee for each release uploads the files to a permanent
                location on Arweave via Bundlr.
              </Typography>
              <Typography gutterBottom>
                Upload Account Balance: {bundlrBalance?.toFixed(4)} SOL ($
                {bundlrUsdBalance.toFixed(2)})
              </Typography>
              <Typography>
                Available Storage: {mbs?.toFixed(2)} MBs{' '}
                {bundlrBalance > 0 && mbs > 0
                  ? `($${(bundlrUsdBalance / mbs)?.toFixed(4)} /MB)`
                  : ''}
              </Typography>
            </>
          )}

          {bundlrBalance > 0 && !notEnoughSol && (
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleToggleMode}
              fullWidth={true}
              size="small"
              sx={{ margin: '15px 0' }}
            >
              <ToggleButton value="deposit">Deposit</ToggleButton>
              <ToggleButton value="withdraw">Withdraw</ToggleButton>
            </ToggleButtonGroup>
          )}
          <InputWrapper>
            <TextField
              fullWidth
              id={mode === 'deposit' ? 'fund' : 'withdraw'}
              name={mode === 'deposit' ? 'fund' : 'withdraw'}
              label={
                `${mode === 'deposit' ? 'Deposit' : 'Withdraw'}` +
                ' Amount (SOL):'
              }
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              type="number"
              variant="standard"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {amount > 0
                      ? `(${(amount / bundlrPricePerMb).toFixed(2)} MBs)`
                      : ''}
                  </InputAdornment>
                ),
              }}
            />
            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              onClick={() => {
                mode === 'deposit' ? handleFund(amount) : handleWithdraw(amount)
              }}
              disabled={inProgress || !amount}
            >
              <Typography variant="body1">
                {!inProgress && (mode === 'deposit' ? 'Deposit' : 'Withdraw')}
              </Typography>
              {inProgress && (
                <Dots msg={'Please approve transaction in wallet'} />
              )}
            </Button>
          </InputWrapper>
        </StyledPaper>
      </Fade>
    </StyledModal>
  )
}

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
}))

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

export default BundlrModalBody
