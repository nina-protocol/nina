import React, { useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import { CoinflowWithdraw } from '@coinflowlabs/react'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { logEvent } from '../utils/event'

const CoinflowWithdrawModal = () => {
  const [open, setOpen] = useState(false)
  const { wallet, connection, email } = useContext(Wallet.Context)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Root sx={{ mt: 0 }}>
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          onClick={() => {
            logEvent('withdraw_initiated', 'engagement', {
              wallet: wallet?.publicKey?.toBase58(),
            })
            setOpen(true)
          }}
          sx={{
            height: '55px',
            width: '100%',
            '&:hover': {
              opacity: '50%',
            },
            paddingRight: '8px',
          }}
        >
          Withdraw to Bank
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
              <CoinflowWithdraw
                wallet={wallet}
                merchantId={'nina'}
                env={
                  process.env.SOLANA_CLUSTER === 'devnet' ? 'sandbox' : 'prod'
                }
                connection={connection}
                onSuccess={async () => {
                  await onSuccess()
                  logEvent('withdraw_success', 'engagement', {
                    wallet: wallet?.publicKey?.toBase58(),
                  })      
                  handleClose()
                }}
                blockchain={'solana'}
                email={email}
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

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(3, 4, 3),
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

const StyledCcContainter = styled('span')(({ theme }) => ({
  paddingLeft: '8px',
  right: '5px',
  display: 'flex',
  position: 'absolute',
  '& svg': {
    height: '20px',
    width: '22.5px',
  },
  [theme.breakpoints.down('md')]: {
    position: 'relative',
    paddingLeft: '16px',
  },
}))

export default CoinflowWithdrawModal
