import React, { useState, useEffect, useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '../contexts/Wallet'
import { swap, swapQuote } from '../utils/swap.js'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

import Box from '@mui/material/Box'
import AutorenewIcon from '@mui/icons-material/Autorenew'

const Swap = ({ refreshBalances }) => {
  const { ninaClient, usdcBalance, solBalance } = useContext(Nina.Context)
  const { wallet, connection } = useContext(Wallet.Context)
  const [inputAmount, setInputAmount] = useState(0)
  const [quote, setQuote] = useState()
  const [isSolToUsdc, setIsSolToUsdc] = useState(false)
  const [baseCurrency, setBaseCurrency] = useState(ninaClient.ids.mints.usdc)
  const [outputCurrency, setOutputCurrency] = useState(
    ninaClient.ids.mints.wsol
  )

  const multiplier = useMemo(() => (isSolToUsdc ? 100 : 10000), [isSolToUsdc])

  const outputAmount = useMemo(() => {
    if (quote) {
      return (
        Math.floor(
          ninaClient.nativeToUi(
            quote?.estimatedAmountOut.toNumber(),
            outputCurrency
          ) * multiplier
        ) / multiplier
      )
    }
    return 0
  }, [quote])

  useEffect(() => {
    refreshQuote()
  }, [usdcBalance, solBalance, isSolToUsdc])

  const refreshQuote = async () => {
    const newBaseCurrency = isSolToUsdc
      ? ninaClient.ids.mints.wsol
      : ninaClient.ids.mints.usdc
    setBaseCurrency(newBaseCurrency)
    setOutputCurrency(
      isSolToUsdc ? ninaClient.ids.mints.usdc : ninaClient.ids.mints.wsol
    )

    const sol = ninaClient.nativeToUi(solBalance, ninaClient.ids.mints.wsol)

    let defaultInputAmount = 0
    if (isSolToUsdc) {
      if (sol > 0.1) {
        defaultInputAmount = Math.floor(sol * 0.25 * multiplier) / multiplier
      } else if (sol > 0) {
        defaultInputAmount = sol
      }
    } else {
      if (usdcBalance > 5) {
        defaultInputAmount =
          Math.floor(usdcBalance * 0.25 * multiplier) / multiplier
      } else if (usdcBalance > 0) {
        defaultInputAmount = usdcBalance
      }
    }
    handleInputAmountChange(defaultInputAmount, newBaseCurrency)
  }

  const handleInputAmountChange = async (amount, currency = baseCurrency) => {
    setInputAmount(amount)
    if (amount > 0) {
      setQuote(
        await swapQuote(
          wallet,
          connection,
          ninaClient.uiToNative(amount, currency),
          isSolToUsdc
        )
      )
    }
  }

  const handleSwap = async () => {
    await swap(quote, wallet, connection)
    refreshBalances()
  }

  return (
    <>
      <InputWrapper>
        <Typography
          mb={0.5}
          variant="h3"
          noWrap
          sx={{ alignItems: 'baseline', textDecoration: 'underline' }}
        >
          {isSolToUsdc ? 'Swap SOL to USDC' : 'Swap USDC to SOL'}
          <AutorenewIcon
            sx={{ marginLeft: '8px', marginBotton: '0px' }}
            fontSize="10px"
            onClick={() => setIsSolToUsdc(!isSolToUsdc)}
          />
        </Typography>
        <SwapWrapper>
          <TextField
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
          <Typography sx={{ margin: '0 10px' }}>For</Typography>
          <TextField
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
          color="primary"
          variant="outlined"
          fullWidth
          onClick={() => handleSwap()}
        >
          <Typography>Swap</Typography>
        </Button>
      </InputWrapper>
    </>
  )
}

const SwapWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
}))

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

export default Swap
