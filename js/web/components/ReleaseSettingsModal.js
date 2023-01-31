import React, { useState, useEffect, useContext, useMemo } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import Dots from './Dots'
import HubPostCreate from './HubPostCreate'
import SettingsIcon from '@mui/icons-material/Settings';
import Royalty from './Royalty'
import Gates from '@nina-protocol/nina-internal-sdk/esm/Gates'




const ReleaseSettingsModal = ({ userHubs, releasePubkey, metadata, userIsRecipient, isAuthority, release, amountHeld }) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { checkIfHasBalanceToCompleteAction, NinaProgramAction } = useContext(
    Nina.Context
  )
  const [selectedHubId, setSelectedHubId] = useState()
  const [inProgress, setInProgress] = useState(false)
  const userHasHubs = useMemo(() => userHubs?.length > 0, [userHubs])

  const handleClose = () => {
    setOpen(false)
    setSelectedHubId()
  }

  console.log('release :>> ', release);

  return (
    <Root>
      {
        (isAuthority || userIsRecipient) && (
          <Button
            onClick={() => setOpen(true)}
            sx={{ height: '22px', width: '28px', m: 0 }}
          >
            <SettingsIcon sx={{ color: 'white' }} />
          </Button>

        )
      }

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
            <Typography>
              Release Settings:
            </Typography>

            {userIsRecipient && (
              <Royalty releasePubkey={releasePubkey} release={release} />
            )}

            {isAuthority && (
              <Gates
                release={release}
                metadata={metadata}
                releasePubkey={releasePubkey}
                isAuthority={isAuthority}
                amountHeld={amountHeld}
                inSettings={true}
              />
            )}

          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
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
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

export default ReleaseSettingsModal
