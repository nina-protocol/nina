import React, { useState, useEffect, useContext, useMemo } from 'react'
import Hub from '../contexts/Hub'
import Nina from '../contexts/Nina'
import Wallet from '../contexts/Wallet'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import {
  Paper,
  Modal,
  Backdrop,
  Fade,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import HubPostCreate from './HubPostCreate'
import { useSnackbar } from 'notistack'
import dynamic from 'next/dynamic'
import Dots from './Dots'

const WalletConnectModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/WalletConnectModal')
)
const AddToHubModal = ({ userHubs, releasePubkey, metadata, hubPubkey }) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { wallet, pendingTransactionMessage } = useContext(Wallet.Context)

  const { hubAddRelease, getHubsForRelease, hubCollaboratorsState } =
    useContext(Hub.Context)
  const { checkIfHasBalanceToCompleteAction, NinaProgramAction } = useContext(
    Nina.Context
  )
  const [selectedHubId, setSelectedHubId] = useState()
  const [inProgress, setInProgress] = useState(false)
  const [filteredHubs, setFilteredHubs] = useState()
  const [canAddContent] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const userHasHubs = useMemo(() => userHubs && userHubs.length > 0, [userHubs])

  useEffect(() => {
    if (wallet.connected) {
      if (userHubs?.length === 1) {
        setSelectedHubId(userHubs[0]?.publicKey)
      }
      const userHubCollaborations = Object.values(hubCollaboratorsState).filter(
        (collaborator) => {
          return (
            collaborator.canAddContent === true &&
            collaborator.collaborator === wallet.publicKey.toBase58()
          )
        }
      )
      const hubsWithPermission = userHubs?.filter((hub) => {
        return userHubCollaborations.some(
          (collaborator) => hub.publicKey === collaborator.hub
        )
      })
      setFilteredHubs(hubsWithPermission)
    }
  }, [wallet?.connected, userHubs])

  const handleRepost = async () => {
    const error = await checkIfHasBalanceToCompleteAction(
      NinaProgramAction.HUB_ADD_RELEASE
    )
    if (error) {
      enqueueSnackbar(error.msg, { variant: 'failure' })
      return
    }

    setInProgress(true)
    enqueueSnackbar('Adding Release to Hub', {
      variant: 'info',
    })

    handleClose()
    const result = await hubAddRelease(selectedHubId, releasePubkey, hubPubkey)
    if (result?.success) {
      await getHubsForRelease(releasePubkey)
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
    } else {
      enqueueSnackbar('Release not added to hub', {
        variant: 'failure',
      })
    }
    setInProgress(false)
    handleClose()
  }
  const handleClose = () => {
    setOpen(false)
    setSelectedHubId(null)
  }
  const handleOpen = () => {
    if (!wallet?.connected) {
      setShowWalletModal(true)
      return
    } else {
      setOpen(true)
    }
  }

  return (
    <Root>
      <ModalToggle
        variant="contained"
        color="primary"
        type="submit"
        onClick={() => handleOpen()}
        sx={{ height: '22px', width: '18px', m: 0 }}
      >
        <AutorenewIcon />
      </ModalToggle>

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
            {!userHasHubs && (
              <>
                <Typography gutterBottom color="black">
                  The connected wallet is not a collaborator on any hub.
                </Typography>
                <Typography>
                  <Link
                    href="/hubs/create"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    Click here to get started setting up your hub.
                  </Link>
                </Typography>
              </>
            )}
            {userHasHubs && (
              <>
                <Typography
                  align="center"
                  variant="h4"
                  id="transition-modal-title"
                  gutterBottom
                  color={'black'}
                >
                  Add {metadata.name} to{' '}
                  {userHubs.length > 1
                    ? 'one of your hubs'
                    : 'your hub: ' + userHubs[0]?.data?.displayName}
                </Typography>

                {filteredHubs?.length > 1 && (
                  <FormControl sx={{ mt: 1 }}>
                    <InputLabel disabled>Select a hub to add to</InputLabel>

                    <Select
                      className="formField"
                      placeholder="Release Reference"
                      displayEmpty
                      label="Select hub"
                      fullWidth
                      variant="standard"
                      onChange={(e) => {
                        setSelectedHubId(e.target.value, filteredHubs)
                      }}
                    >
                      {filteredHubs?.map((hub) => {
                        return (
                          <MenuItem key={hub?.publicKey} value={hub?.publicKey}>
                            {hub?.data?.displayName}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
            <Button
              style={{ marginTop: '15px', textTransform: 'uppercase' }}
              variant="outlined"
              disabled={inProgress || !selectedHubId || !userHasHubs}
              onClick={(e) => handleRepost(e)}
            >
              {inProgress ? (
                <Dots msg={pendingTransactionMessage} />
              ) : (
                <Typography variant="body2">
                  Repost release to your hub
                </Typography>
              )}
            </Button>

            <HubPostCreate
              userHubs={userHubs}
              preloadedRelease={releasePubkey}
              hubPubkey={hubPubkey}
              selectedHubId={selectedHubId}
              setParentOpen={handleClose}
              userHasHubs={userHasHubs}
              canAddContent={canAddContent}
              update={false}
            />
          </StyledPaper>
        </Fade>
      </StyledModal>
      <WalletConnectModal
        inOnboardingFlow={false}
        showWalletModal={showWalletModal}
        forceOpen={showWalletModal}
        setForceOpen={setShowWalletModal}
        action={'repost'}
      />
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: 'min-content',
}))

const ModalToggle = styled(Button)(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  ':disabled': {
    color: theme.palette.text.primary + 'a0',
  },
  '&:hover': {
    opacity: '50%',
    backgroundColor: `${theme.palette.transparent} !important`,
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
  padding: `30px 60px 45px`,
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '600px',
}))

export default AddToHubModal
