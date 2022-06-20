import React, {useState, useEffect, useContext, useMemo} from 'react'
import nina from '@nina-protocol/nina-sdk'
import {styled} from '@mui/material/styles'
import {Box, Paper} from '@mui/material'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import Typography from '@mui/material/Typography'

import {useSnackbar} from 'notistack'
import Dots from './Dots'
import {useWallet} from '@solana/wallet-adapter-react'

const {HubContext, ReleaseContext, NinaContext} = nina.contexts

const UserReleasesPrompt = ({userHubs, releasePubkey, metadata, hubPubkey, hubReleases}) => {
  const [open, setOpen] = useState(false)
  const {enqueueSnackbar} = useSnackbar()
  const wallet = useWallet()

  const {releaseState, getReleasesPublishedByUser, filterReleasesPublishedByUser} = useContext(ReleaseContext)
  const {hubAddRelease, getHub, addToHubQueue} = useContext(HubContext)
  const {collection} = useContext(NinaContext)
  const [selectedHubId, setSelectedHubId] = useState()
  const [inProgress, setInProgress] = useState(false)
  const [canAddContent, setCanAddContent] = useState(false)
  const [userPublishedReleases, setUserPublishedReleases] = useState([])
  const [unpostedUserReleases, setUnpostedUserReleases] = useState([])


  const userHasHubs = useMemo(() => userHubs && userHubs.length > 0, [userHubs])


  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser(wallet.publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUnpostedUserReleases(filterUnpostedReleases(hubReleases))
    }
  }, [releaseState, collection, hubReleases])

  const filterUnpostedReleases =  (hubReleases) => {
    let unposted;
    if (hubReleases.length > 0) {
      const userPostedReleases = filterReleasesPublishedByUser()    
      unposted = userPostedReleases.filter(release => {
        if (!hubReleases?.find(hr => hr.release === release.releasePubkey)) {
          return release
        }
      }) 
    } else {
      unposted = filterReleasesPublishedByUser() 
    }
    return unposted
  }

  const handleRepost = async (release) => {
    enqueueSnackbar(`Adding ${release.metadata.name} to Hub`, {
      variant: 'info',
    })
    console.log('addToHubQue :>> ', addToHubQueue);
    const result = await hubAddRelease(hubPubkey, release.releasePubkey)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
      getHub(hubPubkey)
    } else {
      enqueueSnackbar('Release not added to hub', {
        variant: 'failure',
      })
    }
  }

  if (!unpostedUserReleases) {
    return <></>
  }

  return (
    <Root>
        <ModalToggle
          variant="outlined"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
          sx={{height: '22px', width: '28px', m: 0}}
          fullWidth
        >
          Click to add your existing releases to your hub
        </ModalToggle>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() =>setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Typography variant="h4" mb={1}>
              Click on a Release below to add it to your hub:
            </Typography>
            <Grid container spacing={1}>
              {unpostedUserReleases?.map((release, i) => {
                return (
                  <Grid item md={4} key={i} position='relative'>
                    <ReleaseImage
                      width={50}
                      height={50}
                      layout="responsive"
                      src={release.metadata.image}
                      priority={true}
                      unoptimized={true}
                      loading="eager"
                      onClick={() => handleRepost(release)}
                      sx={{opacity: addToHubQueue.has(release.releasePubkey) ? '50%' : '' }}
                    />
                    {addToHubQueue.has(release.releasePubkey) && (
                      <PendingBox>
                        <Dots size="50px" />
                      </PendingBox>
                    )
                    }
                  </Grid>
                )
              })}
            </Grid>

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
  padding : '0 15px'
}))

const ModalToggle = styled(Button)(({theme}) => ({
  color: `${theme.palette.text.primary} !important`,
  width: '100% !important',
  border: '2px solid red',
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

const StyledPaper = styled(Paper)(({theme}) => ({
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

const ReleaseImage = styled(Image)(({theme}) => ({
  '&:hover': {
    opacity: '50%'
  }
}))

const PendingBox = styled(Box)(({theme}) => ({
  position: 'absolute',
  top: '0',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  background: ``
}))

export default UserReleasesPrompt
