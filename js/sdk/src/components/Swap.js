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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { useSnackbar } from 'notistack'
import Dots from './Dots'
import Divider from '@mui/material/Divider'
import CoinflowWithdrawModal from './CoinflowWithdrawModal'
const Swap = () => {
  const { enqueueSnackbar } = useSnackbar()

  const {
    ninaClient,
    usdcBalance,
    solBalance,
    getUserBalances,
    sendUsdc,
    sendSol,
  } = useContext(Nina.Context)
  const { wallet, connection, pendingTransactionMessage } = useContext(
    Wallet.Context
  )
  const [inputAmount, setInputAmount] = useState(0)
  const [quote, setQuote] = useState()
  const [isSolToUsdc, setIsSolToUsdc] = useState(false)
  const [isUsdcWithdraw, setIsUsdcWithdraw] = useState(true)
  const [baseCurrency, setBaseCurrency] = useState(ninaClient.ids.mints.usdc)
  const [outputCurrency, setOutputCurrency] = useState(
    ninaClient.ids.mints.wsol
  )
  const [pending, setPending] = useState(false)
  const [withdrawPending, setWithdrawPending] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [withdrawTarget, setWithdrawTarget] = useState('')
  const [activeTab, setActiveTab] = useState('withdrawBank')
  const multiplier = useMemo(() => (isSolToUsdc ? 100 : 10000), [isSolToUsdc])
  const swapHeaderTextDecoration = useMemo(
    () => (activeTab === 'swap' ? 'underline' : 'none'),
    [activeTab]
  )
  const withdrawHeaderTextDecoration = useMemo(
    () => (activeTab === 'withdraw' ? 'underline' : 'none'),
    [activeTab]
  )

  const withdrawBankHeaderTextDecoration = useMemo(
    () => (activeTab === 'withdrawBank' ? 'underline' : 'none'),
    [activeTab]
  )

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
      let tx
      if (isUsdcWithdraw) {
        tx = await sendUsdc(withdrawAmount, withdrawTarget)
      } else {
        tx = await sendSol(withdrawAmount, withdrawTarget)
      }

      if (tx.success) {
        enqueueSnackbar('Withdraw Successful', {
          variant: 'success',
        })
        setWithdrawAmount(0)
        setWithdrawTarget('')
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
  const onCoinflowWithdrawSuccess = () => {
    enqueueSnackbar('Withdrawal Successful', {
      variant: 'success',
    })
  }

  const displayForActiveTab = () => {
    switch (activeTab) {
      case 'withdraw':
        return (
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
                    <InputAdornment position="start">Send:</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="start">
                      {isUsdcWithdraw ? 'USDC' : 'SOL'}
                    </InputAdornment>
                  ),
                }}
              />
              <Button onClick={() => setIsUsdcWithdraw(!isUsdcWithdraw)}>
                SWITCH TO {isUsdcWithdraw ? 'SOL' : 'USDC'}
              </Button>
              <Button
                onClick={() =>
                  setWithdrawAmount(
                    isUsdcWithdraw
                      ? usdcBalance
                      : +(
                          Math.round(
                            ninaClient.nativeToUi(
                              solBalance,
                              ninaClient.ids.mints.wsol
                            ) -
                              0.04 +
                              'e' +
                              4
                          ) +
                          'e-' +
                          4
                        )
                  )
                }
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
                sx={{ width: '100%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">To:</InputAdornment>
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
                <Typography variant="body2">
                  Send {isUsdcWithdraw ? 'USDC' : 'SOL'}
                </Typography>
              )}
            </Button>
          </>
        )
      case 'swap':
        return (
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
        )
      case 'withdrawBank':
        return (
          <>
            <Typography variant="h4">
              You can withdraw your USDC balance to your bank account (currently
              only available in USA).
            </Typography>
            <Typography variant="h4">
              Withdraw instantly for a fee, or 3-4 business days for free.
            </Typography>
            <CoinflowWithdrawModal
              onSuccess={() => onCoinflowWithdrawSuccess()}
            />
          </>
        )
    }
  }

  return (
    <>
      <InputWrapper>
        <Box display="flex" alignItems={'center'}>
          <Typography
            variant="h3"
            sx={{
              display: 'inline',
              alignItems: 'baseline',
              textDecoration: withdrawBankHeaderTextDecoration,
              mr: 1,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('withdrawBank')}
          >
            Withdraw to Bank
          </Typography>

          <Divider orientation="vertical" flexItem />

          <Typography
            variant="h3"
            sx={{
              display: 'inline',
              alignItems: 'baseline',
              textDecoration: swapHeaderTextDecoration,
              mr: 1,
              ml: 1,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('swap')}
          >
            Swap
          </Typography>

          <Divider orientation="vertical" flexItem />

          <Typography
            variant="h3"
            sx={{
              display: 'inline',
              alignItems: 'baseline',
              textDecoration: withdrawHeaderTextDecoration,
              ml: 1,
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('withdraw')}
          >
            Send
          </Typography>
        </Box>

        {displayForActiveTab()}
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
  minHeight: '230px',
  justifyContent: 'space-between',
}))

export default Swap
