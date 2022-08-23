import React, { useState, useEffect, useContext, useMemo } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
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

const AddToHubModal = ({ userHubs, releasePubkey, metadata }) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()

  const { hubAddRelease } = useContext(Hub.Context)
  const [selectedHubId, setSelectedHubId] = useState()
  const [inProgress, setInProgress] = useState(false)
  const userHasHubs = useMemo(() => userHubs?.length > 0, [userHubs])

  useEffect(() => {
    if (userHubs?.length === 1) {
      setSelectedHubId(userHubs[0]?.id)
    }
  }, [userHubs])

  const handleRepost = async (e) => {
    setInProgress(true)
    enqueueSnackbar('Adding Release to Hub', {
      variant: 'info',
    })
    handleClose()
    const result = await hubAddRelease(selectedHubId, releasePubkey)
    if (result?.success) {
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
    setSelectedHubId()
  }

  return (
    <Root>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{ height: '22px', width: '28px', m: 0 }}
      >
        <AutorenewIcon sx={{ color: 'white' }} />
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
            {!userHasHubs && (
              <>
                <Typography gutterBottom>
                  {wallet?.connected
                    ? 'The connected wallet is not a collaborator on any hub.'
                    : 'Connect your wallet to see your hubs'}
                </Typography>
                <Typography>
                  <a
                    href="https://docs.google.com/forms/d/1JOgbVh-5SbA4mCwSWAiSolPCAHCjx6baSiJGh0J7N1g"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    Click here to get started setting up your hub.
                  </a>
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
                >
                  Add {metadata.name} to{' '}
                  {userHubs.length > 1
                    ? 'one of your hubs'
                    : 'your hub: ' + userHubs[0]?.json.displayName}
                </Typography>

                {userHubs.length > 1 && (
                  <FormControl sx={{ mt: 1 }}>
                    <InputLabel disabled value="">
                      Select a hub to add to
                    </InputLabel>

                    <Select
                      className="formField"
                      placeholder="Release Reference"
                      displayEmpty
                      label="Select hub"
                      fullWidth
                      variant="standard"
                      onChange={(e, userHubs) => {
                        setSelectedHubId(e.target.value)
                      }}
                    >
                      {userHubs
                        ?.filter((hub) => hub.userCanAddContent)
                        .map((hub) => {
                          return (
                            <MenuItem key={hub?.id} value={hub?.id}>
                              {hub?.json.displayName}
                            </MenuItem>
                          )
                        })}
                    </Select>
                  </FormControl>
                )}
              </>
            )}

            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              disabled={inProgress || !selectedHubId || !userHasHubs}
              onClick={handleRepost}
            >
              <Typography>
                {!inProgress && 'Repost'}
                {inProgress && (
                  <Dots msg={'Please approve transaction in wallet'} />
                )}
              </Typography>
            </Button>

            <HubPostCreate
              preloadedRelease={releasePubkey}
              selectedHubId={selectedHubId}
              setParentOpen={handleClose}
              userHasHubs={userHasHubs}
            />
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

export default AddToHubModal
