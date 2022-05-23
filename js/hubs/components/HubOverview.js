import React, { useMemo, useContext } from 'react'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import nina from '@nina-protocol/nina-sdk'
import ReleaseListTable from './ReleaseListTable'

const { HubContext, NinaContext, ReleaseContext } = nina.contexts

const HubOverview = ({ hubPubkey, isAuthority }) => {
  const { releaseState } = useContext(ReleaseContext)
  const { ninaClient } = useContext(NinaContext)
  const {
    hubState,
    hubContentState,
    hubCollaboratorsState,
    hubFeePending,
    hubWithdraw,
  } = useContext(HubContext)
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  const hubContent = useMemo(() => hubContentState, [hubContentState])
  const hubReleases = useMemo(
    () =>
      Object.values(hubContent).filter(
        (c) => c.contentType === 'NinaReleaseV1'
      ),
    [hubContent]
  )
  const hubCollaborators = useMemo(
    () => hubCollaboratorsState,
    [hubCollaboratorsState]
  )
  const hubSales = useMemo(
    () =>
      hubReleases
        .map((release) => release.sales)
        .reduce((prev, curr) => prev + curr, 0),
    [hubReleases]
  )
  const releases = useMemo(() => {
    const ids =
      Object.values(hubContent)
        ?.filter(
          (content) =>
            content.contentType === 'NinaReleaseV1' &&
            content.publishedThroughHub
        )
        .map((content) => content.release) || []
    const releaseArray = []
    ids.forEach((id) => {
      const recipient = releaseState.tokenData[id].royaltyRecipients.find(
        (recipient) =>
          recipient.recipientAuthority.toBase58() === hubData.hubSigner
      )
      if (recipient) {
        const release = {
          metadata: releaseState.metadata[id],
          tokenData: releaseState.tokenData[id],
          releasePubkey: id,
          recipient,
        }
        releaseArray.push(release)
      }
    })
    return releaseArray
  }, [releaseState, hubContent, hubData])

  const releaseRevenueTotal = useMemo(() => {
    let revenue = 0
    releases.forEach((release) => {
      const recipient = releaseState.tokenData[
        release.releasePubkey
      ].royaltyRecipients.find(
        (recipient) =>
          recipient.recipientAuthority.toBase58() === hubData.hubSigner
      )
      if (recipient) {
        revenue += recipient.owed.toNumber()
        revenue += recipient.collected.toNumber()
      }
    })
    revenue = ninaClient.nativeToUi(revenue, ninaClient.ids.mints.usdc)
    return revenue
  }, [releases])  

  return (
    <Overview>
      {hubData && (
        <>
          <Typography display="inline" variant="h5">
            Welcome to {hubData.json.displayName}.
          </Typography>
          <Typography display="inline" mt={1} sx={{ margin: '0 10px' }}>
            (You are {isAuthority ? 'the Hub authority' : 'a collaborator'})
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            width="fitContent"
            border="1px solid black"
            sx={{
              margin: '10px 0',
              padding: '10px',
              justifyContent: 'space-evenly',
            }}
          >
            <CtaButton
              link="/dashboard?action=publishRelease"
              action="Publish a Release"
              title="Releases Published"
              count={releases.length}
            />
            <Divider orientation="vertical" flexItem />
            <CtaButton
              link="/dashboard?action=releases"
              action="Manage"
              title="Reposted Releases"
              count={hubReleases.length - releases.length}
            />
            <Divider orientation="vertical" flexItem />
            <CtaButton
              link="/dashboard?action=collaborators"
              action="Manage"
              title="Collaborators"
              count={Object.keys(hubCollaborators).length}
            />
            {isAuthority && (
              <>
                <Divider orientation="vertical" flexItem />
                <CtaButton
                  method={() => hubWithdraw(hubPubkey)}
                  action={`Withdraw $${hubFeePending} to wallet`}
                  title="Total Hub Fee Revenue"
                  count={`$${hubData.totalFeesEarned + releaseRevenueTotal}`}
                />
              </>
            )}
          </Box>
          {isAuthority && (
            <HubPublishedContainer>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: '700 !important', padding: '8px' }}
              >
                RELEASES PUBLISHED THROUGH HUB:
              </Typography>
              <ReleaseListTable
                releases={releases}
                hubPubkey={hubPubkey}
                tableType="userPublished"
                key="releases"
              />
            </HubPublishedContainer>
          )}
          <Typography sx={{ fontWeight: '700 !important' }}>
            TOTAL SALES: {hubSales}
          </Typography>
        </>
      )}
    </Overview>
  )
}

const CtaButton = (params) => {
  const { link, title, count, action, method } = params
  return (
    <CtaButtonWrapper>
      <Typography display="inline" sx={{ fontWeight: 'bold' }}>
        {`${count} `}
      </Typography>
      <Typography display="inline">{title}</Typography>
      {link && (
        <Link href={link}>
          <LinkTypography>({action})</LinkTypography>
        </Link>
      )}
      {!link && (
        <a onClick={method}>
          <LinkTypography>({action})</LinkTypography>
        </a>
      )}
    </CtaButtonWrapper>
  )
}

const CtaButtonWrapper = styled(Box)(() => ({
  textAlign: 'center',
}))

const LinkTypography = styled(Typography)(() => ({
  '&:hover': {
    opacity: '50%',
    color: 'black !important',
    cursor: 'pointer !important',
  },
}))

const HubPublishedContainer = styled(Box)(() => ({
  margin: '20px 0',
  border: '1px solid black',
}))

const Overview = styled(Box)(() => ({
  margin: 'auto',
  height: '100%',
  textAlign: 'left',
  minWidth: '740px',
}))

export default HubOverview
