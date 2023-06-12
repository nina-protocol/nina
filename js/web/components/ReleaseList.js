import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ReleaseListTable from './ReleaseListTable'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Link from 'next/link'
import NinaSdk from '@nina-protocol/js-sdk'

const ReleaseList = () => {
  const {
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    collectRoyaltyForRelease,
    releaseState,
  } = useContext(Release.Context)
  const { collection } = useContext(Nina.Context)

  const { wallet } = useContext(Wallet.Context)
  const [userPublishedReleases, setUserPublishedReleases] = useState([])
  const [sales, setSales] = useState(0)
  const [editionTotal, setEditionTotal] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [exchanges, setExchanges] = useState(0)
  const [exchangeSales, setExchangeSales] = useState(0)

  const USDC_MINT_ID = NinaSdk.utils.NINA_CLIENT_IDS[process.env.SOLANA_CLUSTER].mints.usdc

  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser(wallet.publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleases(filterReleasesPublishedByUser())
    }
  }, [releaseState, collection])

  useEffect(() => {
    let salesCount = 0
    let editionCount = 0
    let revenueCount = 0
    let exchangeCount = 0
    let exchangeSalesCount = 0
    userPublishedReleases.forEach((release) => {
      salesCount += release.tokenData.saleCounter
      editionCount += release.tokenData.totalSupply
      revenueCount += release.tokenData.totalCollected
      exchangeCount += release.tokenData.exchangeSaleCounter
      exchangeSalesCount += release.tokenData.exchangeSaleTotal
    })
    setSales(salesCount)
    setEditionTotal(editionCount)
    setRevenue(revenueCount)
    setExchanges(exchangeCount)
    setExchangeSales(exchangeSalesCount)
  }, [userPublishedReleases])

  return (
    <>
      <ScrollablePageWrapper>
        <UserReleaseWrapper>
          {wallet?.connected && userPublishedReleases?.length > 0 && (
            <>
              {sales > 0 && (
                <ReleaseStats>
                  <Typography variant="h1" align="left" gutterBottom>
                    You have released{' '}
                    <span>{userPublishedReleases.length}</span>{' '}
                    {userPublishedReleases.length === 1 ? 'track' : 'tracks'}{' '}
                    and sold
                    <span> {sales}</span> of <span>{editionTotal} </span>{' '}
                    available editions for a total of{' '}
                    <span>
                      {NinaSdk.utils.nativeToUiString(revenue, USDC_MINT_ID)}
                    </span>
                    .{`  You've`} had <span>{exchanges}</span>{' '}
                    {exchanges === 1 ? 'sale' : 'sales'} on the secondary market
                    for a total of{' '}
                    <span>
                      {NinaSdk.utils.nativeToUiString(exchangeSales, USDC_MINT_ID)}
                    </span>
                    .
                  </Typography>

                  <Link
                    href="https://www.notion.so/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612#c7abd525851545a199e06ecd14a16a15"
                    target="_blank"
                    rel="noreferrer"
                    passHref
                  >
                    <a>How do I withdraw my USDC?</a>
                  </Link>
                </ReleaseStats>
              )}
              <ReleaseListTable
                releases={userPublishedReleases}
                tableType="userPublished"
                collectRoyaltyForRelease={collectRoyaltyForRelease}
                key="releases"
              />
            </>
          )}
          {wallet?.connected && userPublishedReleases?.length === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{ paddingBottom: '10px' }}
              >{`You haven't published any music yet.`}</Typography>
              <Link href="/upload" passHref>
                <a>
                  <Typography>Start Uploading</Typography>
                </a>
              </Link>
            </Box>
          )}
        </UserReleaseWrapper>
      </ScrollablePageWrapper>
    </>
  )
}

const ReleaseStats = styled(Box)(({ theme }) => ({
  width: '680px',
  margin: 'auto',
  paddingBottom: '94px',
  '& span': {
    color: theme.palette.blue,
  },
}))

const UserReleaseWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  '& a': {
    color: theme.palette.blue,
  },
}))

export default ReleaseList
