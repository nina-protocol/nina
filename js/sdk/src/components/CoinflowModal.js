import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import { CoinflowEnvs, CoinflowPurchase } from '@coinflowlabs/react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import releasePurchaseHelperTransactionBuilder from '../utils/releasePurchaseHelperTransactionBuilder'

const CoinflowModal = ({ release, releasePubkey, onSuccess }) => {
  const [open, setOpen] = useState(false)
  const [transaction, setTransaction] = useState()
  const { wallet, connection } = useContext(Wallet.Context)
  const { ninaClient } = useContext(Nina.Context)

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    const buildTransaction = async () => {
      const transaction = await releasePurchaseHelperTransactionBuilder(
        releasePubkey,
        ninaClient.provider,
        ninaClient
      )
      setTransaction(transaction)
    }
    buildTransaction()
  }, [release])

  return (
    <>
      <Root sx={{ mt: 0 }}>
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
          sx={{
            height: '55px',
            width: '100%',
            '&:hover': {
              opacity: '50%',
            },
          }}
        >
          Pay with Credit Card
        </Button>

        <StyledModal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={() => handleClose()}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <StyledPaper>
              <StyledCloseIcon onClick={() => handleClose()} />
              <CoinflowPurchase
                wallet={wallet}
                merchantId={'nina'}
                env={'sandbox'}
                connection={connection}
                onSuccess={async () => {
                  await onSuccess()
                  handleClose()
                }}
                blockchain={'solana'}
                webhookInfo={{ item: 'sword' }}
                email={'user-email@email.com'}
                transaction={transaction}
                amount={ninaClient.nativeToUi(
                  release.price,
                  release.paymentMint
                )}
              />
            </StyledPaper>
          </Fade>
        </StyledModal>
      </Root>
    </>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  width: '100%',
}))

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
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
  height: '85vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.black,
  cursor: 'pointer',
}))

// const GateWrapper = styled(Box)(() => ({
//   height: '80%',
//   overflowY: 'auto',
// }))

export default CoinflowModal
