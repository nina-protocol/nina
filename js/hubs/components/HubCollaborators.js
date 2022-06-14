import React, { useState, useContext, useMemo, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useWallet } from '@solana/wallet-adapter-react'
import CloseIcon from '@mui/icons-material/Close'
import Grid from '@mui/material/Grid'
import nina from '@nina-protocol/nina-sdk'
import { useSnackbar } from 'notistack'
import HubAddCollaborator from './HubAddCollaborator'
import CollaboratorPermissions from './CollaboratorPermissions'
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from '../styles/theme/lightThemeOptions.js'

const { HubContext, ReleaseContext } = nina.contexts

const HubCollaborators = ({
  hubPubkey,
  isAuthority,
  authority,
  canAddCollaborators,
}) => {
  const wallet = useWallet()
  const { hubRemoveCollaborator, hubCollaboratorsState } =
    useContext(HubContext)
  const [activeSelection, setActiveSelection] = useState(undefined)
  const hubCollaborators = useMemo(
    () => 
      Object.values(hubCollaboratorsState)
        .filter(c => c.hub === hubPubkey)
        .sort((a, b) => b.datetime - a.datetime),
    [hubCollaboratorsState]
  )

  const { enqueueSnackbar } = useSnackbar()

  const handleActiveSelection = (e) => {
    const selectedHubCollaborator =
      hubCollaborators[e.target.getAttribute('data-index')]
    setActiveSelection(selectedHubCollaborator)
  }

  const canRemoveCollaborators = (collaboratorPubKey) => {
    if (collaboratorPubKey == wallet?.publicKey?.toBase58() || isAuthority) {
      return true
    }
    return false
  }

  const handleRemoveCollaborator = async (e, hubPubkey, collaboratorPubkey) => {
    e.stopPropagation()
    const result = await hubRemoveCollaborator(hubPubkey, collaboratorPubkey)
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: 'info',
      })
    } else {
      enqueueSnackbar('Collaborator Not Removed', {
        variant: 'failure',
      })
    }
  }

  useEffect(() => {
    if (activeSelection) {
      setActiveSelection(hubCollaborators[activeSelection?.publicKey])
    }
  }, [hubCollaborators])

  return (
    <DashboardWrapper
      md={9}
      columnSpacing={2}
      columnGap={2}
      position="relative"
    >
      <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
        <Wrapper>
          <HubAddCollaborator
            hubPubkey={hubPubkey}
            canAddCollaborators={canAddCollaborators}
          />
          <>
            <Note>
              * Allowance determines the amount of actions a collaborator can
              execute on the hub (ie.creating releaseses, adding tracks, adding
              other collaborators).Selecting &apos;Unlimited&apos; will allow
              them unlimited actions. This can be updated at any time.
            </Note>
            <Typography mt={2}>
              Select a Collaborator&apos;s publicKey from the left to edit their
              permissions
            </Typography>
          </>
        </Wrapper>
      </Grid>
      <DashboardContent item md={6}>
        {hubCollaborators && hubCollaborators.length > 0 && (
          <>
            {!activeSelection && (
              <>
                <DashboardHeader fontWeight={600}>
                  There are {hubCollaborators.length} Collaborators
                  associated with this hub:
                </DashboardHeader>
                <ul>
                  <DashboardEntry>
                    {authority} is this hub&#39;s authority
                  </DashboardEntry>
                  {hubCollaborators.map((hubCollaborator) => {
                    if (hubCollaborator.collaborator !== authority) {
                      return (
                        <DashboardEntry
                          key={hubCollaborator.collaborator}
                          data-index={hubCollaborator.publicKey}
                          onClick={(e) => handleActiveSelection(e)}
                        >
                          <>
                            {hubCollaborator.collaborator}
                            {canRemoveCollaborators(
                              hubCollaborator.collaborator
                            ) && (
                              <CloseIcon
                                onClick={(e) =>
                                  handleRemoveCollaborator(
                                    e,
                                    hubPubkey,
                                    hubCollaborator.collaborator
                                  )
                                }
                              >
                                (remove Collaborator from hub)
                              </CloseIcon>
                            )}
                          </>
                        </DashboardEntry>
                      )
                    }
                  })}
                </ul>
              </>
            )}
            {activeSelection?.collaborator && (
              <>
                <Typography fontWeight={600}>Update Permissions:</Typography>
                <CollaboratorPermissions
                  isAuthority={isAuthority}
                  hubPubkey={hubPubkey}
                  activeSelection={activeSelection}
                  canAddCollaborators={canAddCollaborators}
                  setActiveSelection={setActiveSelection}
                />
              </>
            )}
          </>
        )}
        <Typography sx={{ display: { xs: 'block', md: 'none' } }}>
          Please visit your hub on desktop to add / edit collaborators
        </Typography>
      </DashboardContent>
    </DashboardWrapper>
  )
}

const Wrapper = styled(Box)(() => ({
  textAlign: 'left',
  // width: '500px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  margin: 'auto',
}))

const Note = styled(Typography)(({ theme }) => ({
  fontStyle: 'italic',
  marginTop: '30px',
  bottom: '0px',
}))

export default HubCollaborators
