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
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useSnackbar } from 'notistack'
import Dots from './Dots'

const LowBalanceModal = ({ inCreate, displaySmall }) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const {
    solPrice,
    getSolPrice,
    initBundlr,
    lowSolBalance,
    usdcBalance,
    getUsdcBalance,
  } = useContext(Nina.Context)
  const [showBalanceWarning, setShowBalanceWarning] = useState(false)
  const [amount, setAmount] = useState()
  const [inProgress, setInProgress] = useState(false)
  
  useEffect(() => {
    console.log('usdcBalance :>> ', usdcBalance);
    if (lowSolBalance && usdcBalance > 0) {
      setShowBalanceWarning(true)
    }
  }, [lowSolBalance, usdcBalance])

  // const handleFund = async (fundAmount) => {
  //   setInProgress(true)
  //   const result = await bundlrFund(fundAmount)
  //   if (result?.success) {
  //     enqueueSnackbar(result.msg, {
  //       variant: 'info',
  //     })
  //     setOpen(false)
  //   } else {
  //     enqueueSnackbar('Account not funded', {
  //       variant: 'failure',
  //     })
  //   }
  //   setAmount('')
  //   setInProgress(false)
  // }

  // const handleWithdraw = async (withdrawAmount) => {
  //   setInProgress(true)
  //   const result = await bundlrWithdraw(withdrawAmount)
  //   if (result?.success) {
  //     enqueueSnackbar(result.msg, {
  //       variant: 'info',
  //     })
  //     setOpen(false)
  //   } else {
  //     enqueueSnackbar('Withdrawl not completed', {
  //       variant: 'failure',
  //     })
  //   }
  //   setAmount('')
  //   setInProgress(false)
  // }


  return (
    <>
      {showBalanceWarning && (
        <Root>
            <Typography
              align={'right'}
              variant="subtitle1"
              textTransform={'none'}
              onClick={() => setOpen(true)}
            >
              Low Balance
            </Typography>
    
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
                  Convert USDC to SOL
                </Typography>
        
    
              </StyledPaper>
            </Fade>
          </StyledModal>
        </Root>
      )}
    </>
  )
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  // alignItems: displaySmall ? 'right' : 'center',
  // width: displaySmall ? '' : '100%',
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
}))

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

export default LowBalanceModal
