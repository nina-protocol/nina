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
    ninaClient
  } = useContext(Nina.Context)
  const {provider} = ninaClient
  const wallet = useWallet()

  const [showBalanceWarning, setShowBalanceWarning] = useState(false)
  const [amount, setAmount] = useState()
  const [inProgress, setInProgress] = useState(false)
  const [routes, setRoutes] = useState()
  const [buttonText, setButtonText] = useState('Swap')
  useEffect(() => {
    getUsdcBalance()
  }, [])
  
  useEffect(() => {
    console.log('usdcBalance :>> ', usdcBalance);
    if (lowSolBalance && usdcBalance > 0) {
      setShowBalanceWarning(true)
    }
  }, [lowSolBalance, usdcBalance])

  useEffect(() => {
    const getSwapData = async () => {
      const {data} =  await axios.get(
          `https://quote-api.jup.ag/v3/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=${amount * 1000000}&slippageBps=50`
        )
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
      setButtonText(`Swap ${amount} USDC for ${outAmount} SOL`)
    }
  }, [routes])

  const handleSwap = async () => {
    setInProgress(true)
    const transactions = await axios.post('https://quote-api.jup.ag/v3/swap', {
         // route from /quote api
          route: routes[0],
          // user public key to be used for the swap
          userPublicKey: wallet.publicKey.toBase58(),
          // auto wrap and unwrap SOL. default is true
      })

    for await (let tx of Object.values(transactions.data)){
      const transaction = anchor.web3.Transaction.from(Buffer.from(tx, 'base64'))
      console.log('transaction :>> ', transaction);
      const txid = await wallet.sendTransaction(transaction, provider.connection)
      await provider.connection.getParsedConfirmedTransaction(txid, 'confirmed')
      console.log('result :>> ', result);
      console.log(`https://solscan.io/tx/${txid}`)
    }

  
    // if (result?.success) {
    //   enqueueSnackbar(result.msg, {
    //     variant: 'info',
    //   })
    //   setOpen(false)
    // } else {
    //   enqueueSnackbar('Account not funded', {
    //     variant: 'failure',
    //   })
    // }
    setAmount('')
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
                
                <StyledInputWrapper>
                  <StyledTextField
                  variant='standard'
                  value={amount}
                  type="number"
                  max
                  onChange={(e) => {
                    console.log('e.target.value :>> ', e.target.value);
                    setAmount(e.target.value)
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
                  />
                </StyledInputWrapper>
                <Button
                  onClick={() => handleSwap(amount)}
                  variant="outlined"
                  sx={{
                    width: '100%',
                    mt: 1
                  }}
                >
                  {buttonText}
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
