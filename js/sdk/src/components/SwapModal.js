import React, { useState, useEffect, useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '../contexts/Wallet'
import { swap, swapQuote } from '../utils/swap.js'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import Backdrop from '@mui/material/Backdrop'
import AutorenewIcon from '@mui/icons-material/Autorenew'

const SwapModal = ({refreshBalances}) => {
  const { ninaClient, usdcBalance, solBalance } = useContext(Nina.Context)
  const { wallet, connection } = useContext(Wallet.Context)
  const [open, setOpen] = useState(false)
  const [inputAmount, setInputAmount] = useState(0)
  const [quote, setQuote] = useState()
  const [isSolToUsdc, setIsSolToUsdc] = useState(false)
  const [baseCurrency, setBaseCurrency] = useState(ninaClient.ids.mints.usdc)
  const [outputCurrency, setOutputCurrency] = useState(ninaClient.ids.mints.wsol)

  const multiplier = useMemo(() => isSolToUsdc ? 100 : 10000, [isSolToUsdc])

  const outputAmount = useMemo(() => {
    if (quote) {
      return Math.floor(ninaClient.nativeToUi(quote?.estimatedAmountOut.toNumber(), outputCurrency) * multiplier) / multiplier
    }
    return 0
  }, [quote])

  useEffect(() => {
    refreshQuote()
  }, [usdcBalance, solBalance, isSolToUsdc])

  const refreshQuote = async () => {
    const newBaseCurrency = isSolToUsdc ? ninaClient.ids.mints.wsol : ninaClient.ids.mints.usdc
    setBaseCurrency(newBaseCurrency)
    setOutputCurrency(isSolToUsdc ? ninaClient.ids.mints.usdc : ninaClient.ids.mints.wsol)

    const sol = ninaClient.nativeToUi(solBalance, ninaClient.ids.mints.wsol)

    let defaultInputAmount = 0
    if (isSolToUsdc) {
      if (sol > .1) {
        defaultInputAmount = Math.floor(sol * .25 * multiplier) / multiplier
      } else if (sol > 0) {
        defaultInputAmount = sol
      }
    } else {
      if (usdcBalance > 5) {
        defaultInputAmount = Math.floor(usdcBalance * .25 * multiplier) / multiplier
      } else if (usdcBalance > 0) {
        defaultInputAmount = usdcBalance
      }
    }
    handleInputAmountChange(defaultInputAmount, newBaseCurrency)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleInputAmountChange = async (amount, currency = baseCurrency) => {
    setInputAmount(amount)
    if (amount > 0) {
      setQuote(await swapQuote(wallet, connection, ninaClient.uiToNative(amount, currency), isSolToUsdc))
    }
  }

  const handleSwap = async () => {
    await swap(quote, wallet, connection)
    refreshBalances()
    handleClose()
  }

  return (
    <Root>
      <StyledSmallToggle
        align={'right'}
        variant="subtitle1"
        textTransform={'none'}
        onClick={() => setOpen(true)}
      >
        Swap
      </StyledSmallToggle>
      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <InputWrapper>
              <Typography
              variant="h3"
              sx={{ textAlign: 'center' }}
              onClick={() => setIsSolToUsdc(!isSolToUsdc)}
              >
                {isSolToUsdc ? 'Swap SOL to USDC' : 'Swap USDC to SOL'}<AutorenewIcon sx={{marginLeft: '8px'}} fontSize='10px' />
              </Typography>
              <SwapWrapper>
                <TextField
                  sx={{ width: '20%' }}
                  id={'swapInput'}
                  name={'swapInput'}
                  onChange={(e) => handleInputAmountChange(e.target.value)}
                  value={inputAmount}
                  type="number"
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        {isSolToUsdc ? 'SOL' : 'USDC'}
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography sx={{margin: '0 10px'}}>For</Typography>
                <TextField
                  sx={{ width: '20%' }}
                  id={'swapOutput'}
                  name={'swapOutput'}
                  value={outputAmount}
                  type="number"
                  variant="standard"
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        {!isSolToUsdc ? 'SOL' : 'USDC'}
                      </InputAdornment>
                    ),
                  }}
                />
              </SwapWrapper>
              <Button
                style={{ marginTop: '15px' }}
                color="primary"
                variant="outlined"
                onClick={() => handleSwap()}
              >
                Swap
              </Button>
            </InputWrapper>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({ displaySmall }) => ({
  display: 'flex',
  alignItems: displaySmall ? 'right' : 'center',
  width: displaySmall ? '' : '100%',
}))

const SwapWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '40px 0',
}))

const StyledSmallToggle = styled(Typography)(() => ({
  cursor: 'pointer',
  margin: '5px 0',
  textDecoration: 'underline',
  '&:hover': {
    opacity: '50%',
  },
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


export default SwapModal
