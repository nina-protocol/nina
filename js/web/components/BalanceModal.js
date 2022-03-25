import React, { useState, useContext } from 'react'
import * as anchor from "@project-serum/anchor";
import { styled } from '@mui/material/styles'
import { Box, Paper } from '@mui/material'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField';
import nina from 'nina-common'
import { useWallet } from "@solana/wallet-adapter-react";

const { ConnectionContext, NinaContext } = nina.contexts;
const {NinaClient} = nina.utils;

const BalanceModal = () => {
  const { connection } = useContext(ConnectionContext);
  const { usdcBalance, getUsdcBalance } = useContext(NinaContext);
  const wallet = useWallet();

  const [open, setOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState();
  const [outputAmount, setOutputAmount] = useState();
  const [route, setRoute] = useState();

  const handleQuote = async (e) => {
    const input = e.target.value
    setInputAmount(input)
    const { data } = await (
      await fetch(
        `https://quote-api.jup.ag/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${NinaClient.uiToNative(input, 'So11111111111111111111111111111111111111112')}&slippage=0.5&feeBps=20`
      )
    ).json()
    if (data) {
      setRoute(data[0])
      const output = NinaClient.nativeToUi(data[0].outAmountWithSlippage, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      setOutputAmount(output)
      console.log(data)  
    }
  }

  const handleSwap = async () => {
    try {
      const transactions = await (
        await fetch('https://quote-api.jup.ag/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // route from /quote api
            route,
            // user public key to be used for the swap
            userPublicKey: wallet.publicKey.toBase58(),
            // auto wrap and unwrap SOL. default is true
            wrapUnwrapSOL: true,
            // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
            // This is the ATA account for the output token where the fee will be sent to. If you are swapping from SOL->USDC then this would be the USDC ATA you want to collect the fee.
            feeAccount: NinaClient.ids().accounts.vaultUsdc,  
          })
        })
      ).json()
      const {
        setupTransaction,
        swapTransaction,
        cleanupTransaction
      } = transactions
      const serializedTransactions = [setupTransaction, swapTransaction, cleanupTransaction].filter(Boolean).map(tx => anchor.web3.Transaction.from(Buffer.from(tx, 'base64')))
      await wallet.signAllTransactions(serializedTransactions);
      for (let transaction of serializedTransactions) {
        // get transaction object from serialized transaction
  
        // perform the swap
        const txid = await connection.sendRawTransaction(
          transaction.serialize()
        );
  
        await connection.confirmTransaction(txid);
        console.log(`https://solscan.io/tx/${txid}`);
      }
      getUsdcBalance()
    } catch (err) {
      console.log("err ::> ", err)
    }
  }

  return (
    <Root>
      <CtaButton
        // variant="contained"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
      >
        <NavBalance variant="subtitle1">
          {wallet?.connected ? `Balance: $${usdcBalance}` : null}
        </NavBalance>
      </CtaButton>
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
            <Typography align="center" variant="h4" id="transition-modal-title" gutterBottom>
              Swap SOL - USDC
            </Typography>    
            <Typography align="left" variant="subtitle1" >
              Releases on Nina are denominated in USDC - convert some SOL to USDC here.  Powered by jup.ag.
            </Typography>    
              <InputWrapper >
                <TextField
                  fullWidth
                  id="input"
                  name="input"
                  label="You pay (SOL):"
                  onChange={(e) => handleQuote(e)}
                  value={inputAmount}
                />
                <TextField
                  fullWidth
                  id="output"
                  name="output"
                  label="You receive (USDC):"
                  onChange={(e) => setOutputAmount(e.target.value)}
                  value={outputAmount}
                />
                <Button style={{marginTop: '15px'}} color="primary" variant="outlined" onClick={() => handleSwap()} >
                  Swap
                </Button>
              </InputWrapper>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'flex-start',
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
}))

const InputWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column'
}));

const NavBalance = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  textTransform: 'none',
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const CtaButton = styled(Button)(() => ({
  padding: '0px !important'
}));

export default BalanceModal
