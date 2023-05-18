import React, { useState, useEffect, useContext, useMemo } from 'react'
import * as anchor from '@project-serum/anchor'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '../contexts/Wallet'
import { swap, swapQuote } from '../utils/swap.js'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { useSnackbar } from 'notistack'
import Dots from './Dots'
const Swap = () => {
  const { enqueueSnackbar } = useSnackbar()

  const { ninaClient, usdcBalance, solBalance, getUserBalances, sendUsdc } = useContext(
    Nina.Context
  )
  const { wallet, connection, pendingTransactionMessage } = useContext(
    Wallet.Context
  )
  const [inputAmount, setInputAmount] = useState(0)
  const [quote, setQuote] = useState()
  const [isSolToUsdc, setIsSolToUsdc] = useState(false)
  const [baseCurrency, setBaseCurrency] = useState(ninaClient.ids.mints.usdc)
  const [outputCurrency, setOutputCurrency] = useState(
    ninaClient.ids.mints.wsol
  )
  const [pending, setPending] = useState(false)
  const [withdrawPending, setWithdrawPending] = useState(false)
  const [isWithdraw, setIsWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [withdrawTarget, setWithdrawTarget] = useState('')

  const multiplier = useMemo(() => (isSolToUsdc ? 100 : 10000), [isSolToUsdc])
  const swapHeaderTextDecoration = useMemo(() => isWithdraw ? 'none' : 'underline', [isWithdraw])
  const withdrawHeaderTextDecoration = useMemo(() => isWithdraw ? 'underline' : 'none', [isWithdraw])

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
    setPending(true)
    try {
      await swap(quote, wallet, connection)
      await getUserBalances()
      setInputAmount(0)
      enqueueSnackbar('Swap Successful', {
        variant: 'success',
      })
    } catch (e) {
      enqueueSnackbar('Swap Failed', {
        variant: 'failure',
      })
      console.warn(e)
    }
    setPending(false)
  }
  
  const handleWithdraw = async () => {
    setWithdrawPending(true)
    try {
      const tx = await sendUsdc(
        withdrawAmount,
        withdrawTarget
      )
      if (tx.success) {
        enqueueSnackbar('Withdraw Successful', {
          variant: 'success',
        })
      } else {
        enqueueSnackbar(`Withdraw Failed: ${tx.error.msg}`, {
          variant: 'failure',
        })
      }
    } catch (e) {
      console.warn(e)
      enqueueSnackbar('Withdraw Failed', {
        variant: 'failure',
      })
    }
    setWithdrawPending(false)
  }

  return (
    <>
      <InputWrapper>
        <div>
          <Typography
            variant="h3"
            sx={{ display: 'inline', alignItems: 'baseline', textDecoration: swapHeaderTextDecoration, mb: 1, mr: 1, cursor: 'pointer', }}
            onClick={() => setIsWithdraw(false)}
            >
            Swap
          </Typography>
          <Typography
            variant="h3"
            sx={{ display: 'inline', alignItems: 'baseline', textDecoration: withdrawHeaderTextDecoration, mb: 1,  ml: 1, cursor: 'pointer' }}
            onClick={() => setIsWithdraw(true)}
            >
            Withdraw USDC
          </Typography>
        </div>
        {isWithdraw ? (
          <>
          <WithdrawWrapper>
            <TextField
              id={'withdrawAmountInput'}
              name={'withdrawAmountInput'}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              value={withdrawAmount}
              type="number"
              variant="standard"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    Send:
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="start">
                    USDC
                  </InputAdornment>
                ),
              }}
            />
            <Button
              onClick={() => setWithdrawAmount(usdcBalance)}
            >
              MAX
            </Button>
            <TextField
              id={'withdrawTargetInput'}
              name={'withdrawTargetInput'}
              onChange={(e) => setWithdrawTarget(e.target.value)}
              value={withdrawTarget}
              type="string"
              variant="standard"
              sx={{ width: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    To:
                  </InputAdornment>
                ),
              }}
            />
          </WithdrawWrapper>
          <Button
            color="primary"
            variant="outlined"
            fullWidth
            onClick={handleWithdraw}
          >
            {withdrawPending ? (
              <Dots msg={pendingTransactionMessage} />
            ) : (
              <Typography variant="body2">Send</Typography>
            )}
          </Button>
        </>
      ) : (
          <>
            <Typography
              variant="h3"
              sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSolToUsdc ? 'SOL to USDC' : 'USDC to SOL'}
              <SwapHorizIcon
                sx={{ marginLeft: '8px', marginBotton: '0px' }}
                fontSize="large"
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
              onClick={handleSwap}
            >
              {pending ? (
                <Dots msg={pendingTransactionMessage} />
              ) : (
                <Typography variant="body2">Swap</Typography>
              )}
            </Button>
          </>
        )}
      </InputWrapper>
    </>
  )
}

const SwapWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '30px',
  justifyContent: 'space-around',
}))

const WithdrawWrapper = styled(Box)(() => ({
  margin: '30px 0',
  alignItems: 'center',
  justifyContent: 'space-around',
}))

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

export default Swap
