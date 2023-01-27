import React, { useState, useEffect, useContext } from 'react'
import dynamic from 'next/dynamic'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
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

const RoyaltyRecipientForm = dynamic(() => import('./RoyaltyRecipientForm'))

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
  const { collectRoyaltyForRelease } = useContext(Release.Context)
  const { ninaClient } = useContext(Nina.Context)

  useEffect(() => {
    if (release?.revenueShareRecipients) {
      release.revenueShareRecipients.forEach((recipient) => {
        const recipientPubkey = recipient.recipientAuthority
        if (
          wallet?.connected &&
          recipientPubkey === wallet?.publicKey.toBase58()
        ) {
          setUserIsRecipient(true)
          setUserRecipientData(recipient)
          setUserShare(recipient.percentShare / 10000)
          setUserDisplayShare(recipient.percentShare / 10000)
        }
      })
    }
  }, [release?.revenueShareRecipients, wallet?.connected, wallet?.publicKey])

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

  const userIsRecipientUI = () => {
    return (
      <>
        {userIsRecipient && (
          <ToggleButton onClick={toggleForm} fullWidth>
            {formToggleText}
          </ToggleButton>
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
      <SettingsButton
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{
          mt: 1,
          width: '155px',
          height: '55px',
        }}
      >
        <Typography variant="body2" align="left">
          Revenue Share
        </Typography>
      </SettingsButton>
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
            <Typography align="center" variant="h4" id="transition-modal-title">
              Revenue Share Information:
            </Typography>
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
                      'Your Royalties:'
                    ) : (
                      <a
                        href={`https://explorer.solana.com/address/${recipient.recipientAuthority}`}
                        rel="noopener"
                      >
                        {`Collaborator ${i}`}
                      </a>
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
                        <CollectButton
                          onClick={() => handleCollectRoyalty(recipient)}
                        >
                          Collect
                        </CollectButton>
                      )

                    return (
                      <ListItem key={i} divider alignItems="center">
                        <ListItemText
                          className={classes.recipientData}
                          disableTypography
                          primary={recipientHandle}
                          secondary={
                            <Box ml={0} className={classes.recipientDat}>
                              <Typography variant="body2">
                                {percentShare}
                              </Typography>
                              <Typography variant="body2">{owed}</Typography>
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
const CollectButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderRadius: '0px',
  border: `1px solid ${theme.palette.text.primary}`,
}))
const ToggleButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '14px !important',
  padding: 0,
  marginTop: 5,
}))
const SettingsButton = styled(Button)(({ theme }) => ({
  '& p': {
    padding: '10px',
    '&:hover': {
      opacity: '50%',
    },
  },
}))

const Root = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: 'black',
  [theme.breakpoints.down('md')]: {},
  [`& .${classes.recipientData}`]: {
    color: `${theme.palette.greyLight}`,
    '& a': {
      color: `${theme.palette.purple}`,
    },
  },
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
}))

export default Royalty
