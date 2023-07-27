import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { imageManager } from '../utils'
import CoinflowModal from './CoinflowModal'
import Nina from '../contexts/Nina'
import Wallet from '../contexts/Wallet'
import { useEffect } from 'react'
const { getImageFromCDN, loader } = imageManager

const PurchaseModal = ({
  release,
  releasePubkey,
  metadata,
  payWithUSDC,
  payWithCardCallback,
  Contents,
  showWalletModal,
  setShowWalletModal,
}) => {
  const [open, setOpen] = useState(false)

  const { wallet } = useContext(Wallet.Context)

  const { ninaClient } = useContext(Nina.Context)

  const handleClose = () => {
    setOpen(false)
  }
  const onCoinflowSuccess = () => {
    payWithCardCallback()
    handleClose()
  }

  const handleOpen = (e) => {
    if (!wallet.connected) {
      setShowWalletModal(true)
    } else {
      if (release.price === 0) {
        payWithUSDC(e)
      } else {
        setOpen(true)
      }
    }
  }

  useEffect(() => {
    if (showWalletModal && wallet.connected) {
      setShowWalletModal(false)
      if (release.price === 0) {
        payWithUSDC()
      } else {
        setOpen(true)
      }
    }
  }, [showWalletModal, wallet.connected])

  return (
    <Root>
      <Button
        onClick={(e) => handleOpen(e)}
        variant="outlined"
        color="primary"
        type="submit"
        sx={{
          height: '55px',
          width: '100%',
          '&:hover': {
            opacity: '50%',
          },
        }}
        fullWidth
      >
        <Contents />
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

            <StyledTypography variant="h4">Collect Release:</StyledTypography>
            <Wrapper>
              <AlbumArt>
                <Image
                  src={getImageFromCDN(metadata.image, 100)}
                  loader={loader}
                  height="100px"
                  width="100px"
                  layout="responsive"
                />
              </AlbumArt>
              <Box>
                <Typography variant="h3">
                  {metadata.properties.artist}
                </Typography>
                <Typography variant="h4">
                  {metadata.properties.title}
                </Typography>
                <Typography variant="subtitle1">
                  Price:{' '}
                  {ninaClient.nativeToUiString(
                    release.price,
                    release.paymentMint
                  )}
                </Typography>
              </Box>
            </Wrapper>

            <Button
              onClick={(e) => {
                payWithUSDC(e)
                handleClose()
              }}
              variant="outlined"
              color="primary"
              type="submit"
              sx={{
                height: '55px',
                width: '100%',
                '&:hover': {
                  opacity: '50%',
                },
                marginBottom: '8px',
              }}
              disabled={release.remainingSupply === 0 ? true : false}
            >
              Pay with {ninaClient.isUsdc(release.paymentMint) ? 'USDC' : 'SOL'}
            </Button>

            <CoinflowModal
              release={release}
              releasePubkey={releasePubkey}
              onSuccess={onCoinflowSuccess}
            />
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
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
  maxHeight: '90vh',
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

const AlbumArt = styled(Box)(() => ({
  width: '100px',
  height: '100px',
}))

const Wrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '100px auto',
  gridGap: 8,
  marginTop: 8,
  marginBottom: 8,
  alignContent: 'start',
})

export default PurchaseModal
