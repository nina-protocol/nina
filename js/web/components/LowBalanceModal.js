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
import axios from 'axios'
import {useWallet} from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'


const LowBalanceModal = () => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const {
    solPrice,
    getSolPrice,
    lowSolBalance,
    usdcBalance,
    getUserBalances,
    ninaClient,
    getUsdcToSolSwapData,
    swapUsdcToSol,
  } = useContext(Nina.Context)
  const [showBalanceWarning, setShowBalanceWarning] = useState(false)
  const [amount, setAmount] = useState()
  const [inProgress, setInProgress] = useState(false)
  const [routes, setRoutes] = useState()
  const [buttonText, setButtonText] = useState('Enter Swap Amount')
  useEffect(() => {
    getUserBalances()
  }, [])
  
  useEffect(() => {
    if (lowSolBalance && usdcBalance > 0) {
      setShowBalanceWarning(true)
    }
  }, [lowSolBalance, usdcBalance])

  useEffect(() => {
    const getSwapData = async () => {
      console.log('amount :>> ', amount);
      console.log('usdcBalance :>> ', typeof (usdcBalance * 1));
      const data = await getUsdcToSolSwapData(amount)
      console.log('data :>> ', data);
      setRoutes(data.data)
      return data
    }

    if (amount > 0) {
      getSwapData()
    }
  }, [amount])

  //MOVE TO NINA CONTEXT
  useEffect(() => {
    if (routes) {
      console.log('routes :>> ', routes);
      const outAmount = routes[0].outAmount / 1000000000
      if (amount > (usdcBalance * 1)) {
        setButtonText('Insufficient balance')
      } else {
        setButtonText(`Swap ${amount} USDC for ${outAmount} SOL`)
      }
    }
  }, [routes])

  const handleSwap = async () => {
    setInProgress(true)
    const result = await swapUsdcToSol(routes)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
      setOpen(false)
    } else {
      enqueueSnackbar('Swap Unsuccesful', {
        variant: 'failure',
      })
    }
    setAmount()
    setInProgress(false)
  }

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
                <Typography
                  align="left"
                  variant="body1"
                  gutterBottom
                >
                  Your Solana balance is below 0.01 which may cause transactions to fail.
                </Typography>
                <Typography
                  align="left"
                  variant="body1"
                  gutterBottom
                >
                  You have a balance of {usdcBalance} USDC. You can use the swap below to convert some USDC to Sol.
                </Typography>
                
                <StyledInputWrapper>
                  <StyledTextField
                  variant='standard'
                  value={amount}
                  type="number"
                  max
                  onChange={(e) => {
                    console.log('e.target.value :>> ', e.target.value);
                    if (e.target.value >= 0) {
                      setAmount(e.target.value)
                    }
                  }}
                  label={
                      `Swap Amount (USDC to SOL):` 
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          USDC
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      min: 0,
                      max:10
                    }}
                  />
                </StyledInputWrapper>
                <Button
                  onClick={() => handleSwap(amount)}
                  variant="outlined"
                  sx={{
                    width: '100%',
                    mt: 1
                  }}
                  disabled={
                    !amount || 
                    inProgress ||
                    (amount > (usdcBalance * 1))
                  }
                >
                  {inProgress ? <Dots size={'63px'}/> : buttonText}
                </Button>
      
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

const StyledTextField = styled(TextField)(() => ({
  '& input': {
    textAlign: 'right',
    paddingRight: '5px'
  }
}))

const StyledInputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

export default LowBalanceModal
