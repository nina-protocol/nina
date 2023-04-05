import React, { useMemo, useContext, useState } from 'react'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import {
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
} from '../styles/theme/lightThemeOptions.js'

const HubReleases = ({ hubPubkey, hubContent, isAuthority, canAddContent }) => {
  const { wallet } = useContext(Wallet.Context)
  const { hubContentToggleVisibility, hubState } = useContext(Hub.Context)
  const { releaseState } = useContext(Release.Context)
  const hubData = useMemo(() => hubState[hubPubkey], [hubState])
  const { enqueueSnackbar } = useSnackbar()
  const hubReleases = useMemo(
    () =>
      Object.values(hubContent)
        .filter(
          (c) =>
            c.contentType === 'ninaReleaseV1' &&
            c.visible &&
            c.hub === hubPubkey
        )
        .sort((a, b) => b.datetime - a.datetime),
    [hubContent]
  )

  const hubReleasesArchived = useMemo(
    () =>
      Object.values(hubContent).filter(
        (c) => c.contentType === 'ninaReleaseV1' && !c.visible
      ),
    [hubContent]
  )
  const [hubReleasesShowArchived, sethubReleasesShowArchived] = useState(false)
  const activeHubReleases = useMemo(
    () => (hubReleasesShowArchived ? hubReleasesArchived : hubReleases),
    [hubReleasesShowArchived, hubReleases, hubReleasesArchived]
  )

  const canToggleRelease = (releasePubkey) => {
    const release = releaseState.tokenData[releasePubkey]
    if (release.authority == wallet?.publicKey?.toBase58() || isAuthority) {
      return true
    }
    return false
  }

  const handleToggleRelease = async (hubPubkey, releasePubkey) => {
    const result = await hubContentToggleVisibility(
      hubPubkey,
      releasePubkey,
      'Release'
    )
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'info' : 'failure',
    })
  }

  return (
    <DashboardWrapper md={9} columnSpacing={2} columnGap={2}>
      <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
        <Link href={`/${hubData.handle}/dashboard?action=publishRelease`}>
          <a>
            <CreateCta variant="outlined" fullWidth>
              Publish a new release
            </CreateCta>
          </a>
        </Link>

        <Typography fontStyle="italic" gutterBottom>
          Clicking &apos;X&apos; on a release will archive it, releases can be
          unarchived at any time.
        </Typography>
        <Typography fontStyle="italic" gutterBottom>
          NOTE: THIS DOES NOT DELETE THE RELEASE, IT WILL STILL BE VISIBLE ON
          NINAPROTOCOL.COM.
        </Typography>
        <Typography fontStyle="italic">
          A asterisk ( * ) next to a release indicates that it was published
          through this hub.
        </Typography>
      </Grid>
      <DashboardContent item md={6}>
        {activeHubReleases && (
          <>
            <DashboardHeader style={{ fontWeight: 600 }}>
              There are {Object.keys(activeHubReleases).length}{' '}
              {hubReleasesShowArchived ? 'archived' : ''} releases associated
              with this hub:
            </DashboardHeader>
            <ul>
              {Object.keys(activeHubReleases).map((releasePubkey) => {
                const hubRelease = activeHubReleases[releasePubkey]
                return (
                  <DashboardEntry key={hubRelease.release}>
                    <Link
                      href={`/${hubData.handle}/releases/${hubRelease.publicKey}`}
                    >
                      <a>
                        {`${hubRelease.publishedThroughHub ? '*' : ''}${
                          releaseState.metadata[hubRelease.release]?.name
                        } (${hubRelease.sales} ${
                          hubRelease.sales === 1 ? 'sale' : 'sales'
                        })`}
                      </a>
                    </Link>
                    {canToggleRelease(hubRelease.release) &&
                      hubReleasesShowArchived && (
                        <AddIcon
                          onClick={() =>
                            handleToggleRelease(hubPubkey, hubRelease.release)
                          }
                        ></AddIcon>
                      )}
                    {canToggleRelease(hubRelease.release) &&
                      !hubReleasesShowArchived && (
                        <CloseIcon
                          onClick={() =>
                            handleToggleRelease(hubPubkey, hubRelease.release)
                          }
                        ></CloseIcon>
                      )}
                  </DashboardEntry>
                )
              })}

              {Object.keys(hubReleasesArchived).length > 0 && (
                <Button
                  onClick={() =>
                    sethubReleasesShowArchived(!hubReleasesShowArchived)
                  }
                  sx={{ paddingLeft: '0' }}
                >
                  View{' '}
                  {
                    Object.keys(
                      !hubReleasesShowArchived
                        ? hubReleasesArchived
                        : hubReleases
                    ).length
                  }{' '}
                  {!hubReleasesShowArchived ? 'Archived' : ''} Releases
                </Button>
              )}
            </ul>
          </>
        )}

        <Typography sx={{ display: { xs: 'block', md: 'none' } }}>
          Please visit your hub on desktop to add releases
        </Typography>
      </DashboardContent>
    </DashboardWrapper>
  )
}

const CreateCta = styled(Button)(() => ({
  display: 'flex',
  margin: '0px auto 40px !important',
}))

export default HubReleases
