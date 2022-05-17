import React, {useState, useEffect, useContext, useMemo} from 'react'
import {styled} from '@mui/material/styles'
import {Box, Paper} from '@mui/material'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import {FormControl , InputLabel} from '@mui/material'
import HubPostCreate from './HubPostCreate'

import nina from '@nina-protocol/nina-sdk'
import {useSnackbar} from 'notistack'
import Dots from './Dots'

const {HubContext, NinaContext} = nina.contexts

const AddToHubModal = ({userHubs, releasePubkey, metadata}) => {
  const [open, setOpen] = useState(false)
  const {enqueueSnackbar} = useSnackbar()
  const {ninaClient} = useContext(NinaContext)

  const {hubAddRelease} = useContext(HubContext)

  const [mode, setMode] = useState('deposit')
  const [selectedHubId, setSelectedHubId] = useState()

  const [inProgress, setInProgress] = useState(false)

  const handleRepost = async (e) => {
    setInProgress(true)
    enqueueSnackbar('Adding Release to Hub', {
      variant: 'info',
    })
    const result = await hubAddRelease(selectedHubId, releasePubkey)
    console.log('result :>> ', result);
    if (result.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
    } else {
      enqueueSnackbar('Collaborator Not Added', {
        variant: 'failure',
      })
    }
    setInProgress(false)

  }
  return (
    <Root>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
        >
          <AutorenewIcon />
        </Button>

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
              Add {metadata.name} to one of your hubs
            </Typography>
     
            <FormControl width="200px">
              <InputLabel disabled value="">
                Select a hub to add 
              </InputLabel>
            
              <Select
                className="formField"
                placeholder="Release Reference"
                displayEmpty
                label="Select hub to add to release to"
                style={{width: '300px'}}
                onChange={(e, userHubs) => {
                  setSelectedHubId(e.target.value)
                }}
              >
                {userHubs?.map((hub) => {
                  return (
                    <MenuItem
                      key={hub?.id}
                      value={hub?.id}
                    >
                      {hub?.json.displayName}
                    </MenuItem>
                  )
                })}
              </Select>

            </FormControl>

            <Button
              style={{marginTop: '15px'}}
              color="primary"
              variant="outlined"
              disabled={inProgress || !selectedHubId}
              onClick={handleRepost}
            >
              <Typography>
                {!inProgress && ('Repost release to your hub')}
                {inProgress && (
                  <Dots msg={'Please aprrove transaction in wallet'} />
                )}

              </Typography>
            </Button>

            <HubPostCreate preloadedRelease={releasePubkey} selectedHubId={selectedHubId} />

          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}


const Root = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column'
}))

export default AddToHubModal
