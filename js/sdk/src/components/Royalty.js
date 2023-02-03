import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import RoyaltyRecipientForm from './RoyaltyRecipientForm'
import Link from 'next/link'
import CloseIcon from '@mui/icons-material/Close'

const Royalty = (props) => {
  const { release, releasePubkey } = props

  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [formShown, setFormShown] = useState(false)
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [userRecipientData, setUserRecipientData] = useState(undefined)
  const [userShare, setUserShare] = useState(undefined)
  const [userDisplayShare, setUserDisplayShare] = useState(undefined)
  const [formToggleText, setFormToggleText] = useState(
    'Add Revenue Split Recipient'
  )
  const { ninaClient } = useContext(Nina.Context)
  const { collectRoyaltyForRelease } = useContext(Release.Context)

  useEffect(() => {
    if (release?.revenueShareRecipients) {
      release.revenueShareRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority === wallet?.publicKey.toBase58()
        ) {
          setUserIsRecipient(true)
          setUserRecipientData(recipient)
          setUserShare(recipient.percentShare / 10000)
          setUserDisplayShare(recipient.percentShare / 10000)
        }
      })
    }
  }, [release?.revenueShareRecipients, wallet?.connected])

  const toggleForm = () => {
    if (!formShown) {
      setFormShown(true)
      setFormToggleText('Cancel')
    } else {
      setFormShown(false)
      setFormToggleText('Add Revenue Split Recipient')
    }
  }

  const handleCollectRoyalty = (recipient) => {
    collectRoyaltyForRelease(recipient, releasePubkey)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const userIsRecipientUI = () => {
    return (
      <>
        {userIsRecipient && (
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleForm}
            fullWidth
          >
            {formToggleText}
          </Button>
        )}
        {formShown && (
          <RoyaltyRecipientForm
            release={release}
            userRecipientData={userRecipientData}
            userShare={userShare}
            setUserShare={setUserShare}
            userDisplayShare={userDisplayShare}
            setUserDisplayShare={setUserDisplayShare}
            releasePubkey={releasePubkey}
            toggleForm={toggleForm}
          />
        )}
      </>
    )
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        fullWidth
        sx={{
          mt: 1,
          '&:hover': {
            opacity: '50%',
          },
        }}
      >
        <StyledTypography variant="body2">Revenue Share Info</StyledTypography>
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
            <StyledCloseIcon onClick={() => handleClose()} />

            <StyledTypography
              align="center"
              variant="h4"
              id="transition-modal-title"
            >
              Revenue Share Information:
            </StyledTypography>
            <List>
              {release?.revenueShareRecipients &&
                release.revenueShareRecipients.map((recipient, i) => {
                  if (recipient.percentShare > 0) {
                    const walletAuthorizedToCollect =
                      wallet?.connected &&
                      wallet?.publicKey.toBase58() ===
                        recipient?.recipientAuthority
                        ? true
                        : false
                    const recipientHandle = walletAuthorizedToCollect ? (
                      'Your Revenue Share:'
                    ) : (
                      <Link
                        href={`/profiles/${recipient.recipientAuthority}`}
                        passHref
                      >
                        <a rel="noopener">
                          <StyledTypography>
                            {`Collaborator ${i}`}
                          </StyledTypography>
                        </a>
                      </Link>
                    )
                    const percentShare = `percent share: ${
                      walletAuthorizedToCollect
                        ? userDisplayShare
                        : recipient.percentShare / 10000
                    }%`

                    const owed =
                      walletAuthorizedToCollect && recipient.owed > 0
                        ? `owed: ${ninaClient.nativeToUiString(
                            recipient.owed,
                            release.paymentMint
                          )}`
                        : ''

                    const collectButton = walletAuthorizedToCollect &&
                      recipient.owed > 0 && (
                        <Button
                          onClick={() => handleCollectRoyalty(recipient)}
                          variant="contained"
                          color="primary"
                        >
                          Collect
                        </Button>
                      )

                    return (
                      <ListItem key={i} divider alignItems="center">
                        <StyledListItemText
                          className={classes.recipientData}
                          disableTypography
                          primary={recipientHandle}
                          secondary={
                            <Box ml={0} className={classes.recipientDat}>
                              <StyledTypography variant="body2">
                                {percentShare}
                              </StyledTypography>
                              <StyledTypography variant="body2">
                                {owed}
                              </StyledTypography>
                            </Box>
                          }
                        />

                        {collectButton}
                      </ListItem>
                    )
                  }
                })}
            </List>
            {wallet?.connected && userIsRecipient ? userIsRecipientUI() : null}
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const PREFIX = 'Royalty'

const classes = {
  recipientData: `${PREFIX}-recipientData`,
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',

  [`& .${classes.recipientData}`]: {
    color: `${theme.palette.greyLight}`,
    '& a': {
      color: `${theme.palette.purple}`,
    },
  },
  '& button': {
    height: '55px',
  },
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

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  color: theme.palette.black,
}))

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.black,
  cursor: 'pointer',
}))

export default Royalty
