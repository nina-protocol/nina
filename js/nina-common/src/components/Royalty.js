import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Paper } from '@mui/material'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useWallet } from '@solana/wallet-adapter-react'
import RoyaltyRecipientForm from './RoyaltyRecipientForm'
import { NameContext, ReleaseContext } from '../contexts'
import NinaClient from '../utils/client'

const Royalty = (props) => {
  const { release, releasePubkey } = props

  const wallet = useWallet()
  const [open, setOpen] = useState(false)
  const [formShown, setFormShown] = useState(false)
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [userRecipientData, setUserRecipientData] = useState(undefined)
  const [userShare, setUserShare] = useState(undefined)
  const [userDisplayShare, setUserDisplayShare] = useState(undefined)
  const [formToggleText, setFormToggleText] = useState('Add Royalty Recipient')
  const { collectRoyaltyForRelease } = useContext(ReleaseContext)
  const { twitterHandlePublicKeyMap, lookupUserTwitterHandle } =
    useContext(NameContext)

  useEffect(() => {
    if (release?.royaltyRecipients) {
      release.royaltyRecipients.forEach((recipient) => {
        const recipientPubkey = recipient.recipientAuthority.toBase58()
        if (
          recipient.percentShare.toNumber() > 0 &&
          !twitterHandlePublicKeyMap[recipientPubkey]
        ) {
          lookupUserTwitterHandle(recipient.recipientAuthority)
        }
        if (
          wallet?.connected &&
          recipient.recipientAuthority.toBase58() ===
            wallet?.publicKey.toBase58()
        ) {
          setUserIsRecipient(true)
          setUserRecipientData(recipient)
          setUserShare(recipient.percentShare.toNumber() / 10000)
          setUserDisplayShare(recipient.percentShare.toNumber() / 10000)
        }
      })
    }
  }, [release?.royaltyRecipients, wallet?.connected])

  const toggleForm = () => {
    if (!formShown) {
      setFormShown(true)
      setFormToggleText('Cancel')
    } else {
      setFormShown(false)
      setFormToggleText('Add Royalty Recipient')
    }
  }

  const handleCollectRoyalty = (recipient) => {
    collectRoyaltyForRelease(recipient, releasePubkey)
  }

  const userIsRecipientUI = () => {
    return (
      <>
        {userIsRecipient && (
          <Button
            variant="contained"
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
      >
        <Typography variant="body2">Royalty Info</Typography>
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
            <Typography align="center" variant="h4" id="transition-modal-title">
              Royalty Information:
            </Typography>
            <List>
              {release?.royaltyRecipients &&
                release.royaltyRecipients.map((recipient, i) => {
                  if (recipient.percentShare.toNumber() > 0) {
                    const walletAuthorizedToCollect =
                      wallet?.connected &&
                      wallet?.publicKey.toBase58() ===
                        recipient?.recipientAuthority.toBase58()
                        ? true
                        : false
                    const twitterHandle =
                      twitterHandlePublicKeyMap[
                        recipient.recipientAuthority.toBase58()
                      ]
                    const recipientHandle = walletAuthorizedToCollect ? (
                      'Your Royalties:'
                    ) : (
                      <a
                        href={
                          twitterHandle
                            ? `https://www.twitter.com/${twitterHandle}`
                            : `https://explorer.solana.com/address/${recipient.recipientAuthority.toBase58()}`
                        }
                        rel="noopener"
                      >
                        {twitterHandlePublicKeyMap[
                          recipient.recipientAuthority.toBase58()
                        ] || `Collaborator ${i}`}
                      </a>
                    )
                    const percentShare = `percent share: ${
                      walletAuthorizedToCollect
                        ? userDisplayShare
                        : recipient.percentShare.toNumber() / 10000
                    }%`

                    const owed =
                      walletAuthorizedToCollect && recipient.owed.toNumber() > 0
                        ? `owed: ${NinaClient.nativeToUiString(
                            recipient.owed.toNumber(),
                            release.paymentMint
                          )}`
                        : ''

                    const collectButton = walletAuthorizedToCollect &&
                      recipient.owed.toNumber() > 0 && (
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
            {wallet?.connected &&
            userIsRecipient
              ? userIsRecipientUI()
              : null}
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
}))

export default Royalty
