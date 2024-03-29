import React, { useMemo, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import ReleaseListTable from './ReleaseListTable'

const HubOverview = ({ hubPubkey, isAuthority }) => {
  const { releaseState } = useContext(Release.Context)
  const { ninaClient } = useContext(Nina.Context)
  const {
    hubState,
    hubContentState,
    hubCollaboratorsState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    getHubFeePending,
    hubWithdraw,
  } = useContext(Hub.Context)
  const [hubFeePending, setHubFeePending] = useState(0)

  useEffect(() => {
    const handleGetHubFeePending = async () => {
      const hubFee = await getHubFeePending(hubPubkey)
      setHubFeePending(hubFee)
    }
    handleGetHubFeePending()
  }, [])
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  const hubReleases = useMemo(
    () => filterHubContentForHub(hubPubkey)[0],
    [hubContentState, hubPubkey]
  )
  const hubCollaborators = useMemo(
    () => filterHubCollaboratorsForHub(hubPubkey),
    [hubCollaboratorsState, hubPubkey]
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
      filterHubContentForHub(hubPubkey)[0].map((content) => content.release) ||
      []
    const releaseArray = []
    ids.forEach((id) => {
      const recipient = releaseState.tokenData[id].revenueShareRecipients.find(
        (recipient) => recipient.recipientAuthority === hubData.hubSigner
      )
      if (recipient) {
        let hubReleasePubkey = Object.values(hubContentState).find(
          (content) => content.release === id
        ).hubReleaseId
        const release = {
          metadata: releaseState.metadata[id],
          tokenData: releaseState.tokenData[id],
          releasePubkey: id,
          recipient,
          hubReleasePubkey,
        }
        releaseArray.push(release)
      }
    })
    return releaseArray
  }, [releaseState, hubContentState, hubData, hubPubkey])

  const releaseRevenueTotal = useMemo(() => {
    let revenue = 0
    releases.forEach((release) => {
      const recipient = releaseState.tokenData[
        release.releasePubkey
      ].revenueShareRecipients.find(
        (recipient) => recipient.recipientAuthority === hubData.hubSigner
      )
      if (recipient) {
        revenue += recipient.owed
        revenue += recipient.collected
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
            Welcome to {hubData.data.displayName}.
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
              link={`/${hubData.handle}/dashboard?action=publishRelease`}
              action="Publish a Release"
              title="Releases Published"
              count={releases.length}
            />
            <Divider orientation="vertical" flexItem />
            <CtaButton
              link={`/${hubData.handle}/dashboard?action=releases`}
              action="Manage"
              title="Reposted Releases"
              count={hubReleases?.length - releases.length}
            />
            <Divider orientation="vertical" flexItem />
            <CtaButton
              link={`/${hubData.handle}/dashboard?action=collaborators`}
              action="Manage"
              title="Collaborators"
              count={Object.keys(hubCollaborators || []).length}
            />
            {isAuthority && (
              <>
                <Divider orientation="vertical" flexItem />
                <CtaButton
                  method={() => hubWithdraw(hubPubkey)}
                  action={`Withdraw $${hubFeePending} to wallet`}
                  title="Total Hub Fee Revenue"
                  count={`$${(
                    ninaClient.nativeToUi(
                      hubData.totalFeesEarned,
                      ninaClient.ids.mints.usdc
                    ) + releaseRevenueTotal
                  ).toFixed(4)}`}
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
                hubData={hubData}
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
          <a>
            <LinkTypography>({action})</LinkTypography>
          </a>
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

const HubPublishedContainer = styled(Box)(({ theme }) => ({
  margin: '20px 0',
  border: '1px solid black',
  height: '60%',
  overflowY: 'scroll',
  [theme.breakpoints.down('md')]: {
    margin: '20px 0 0 0',
  },
}))

const Overview = styled(Box)(() => ({
  margin: 'auto',
  height: '100%',
  textAlign: 'left',
  minWidth: '740px',
}))

export default HubOverview
