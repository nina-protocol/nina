import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import NinaBox from './NinaBox'
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'
import ExchangeComponent from './Exchange'
const ReleaseComponent = ({ metadataSsr }) => {
  const router = useRouter()
  const releasePubkey = router.query.releasePubkey
  const [amountHeld, setAmountHeld] = useState()
  const wallet = useWallet()
  const { releaseState, getRelease } = useContext(Release.Context)
  const { exchangeState } = useContext(Exchange.Context)
  const { getHubsForUser, filterHubsForUser, hubState } = useContext(
    Hub.Context
  )
  const [userHubs, setUserHubs] = useState()
  const [userIsRecipient, setUserIsRecipient] = useState(false)

  const [metadata, setMetadata] = useState(
    metadataSsr || releaseState?.metadata[releasePubkey] || null
  )
  const release = useMemo(
    () => releaseState.tokenData[releasePubkey],
    [releaseState, releasePubkey]
  )

  const isAuthority = useMemo(() => {
    if (wallet.connected) {
      return release?.authority === wallet?.publicKey.toBase58()
    } else {
      return false
    }
  }, [release, wallet.connected])

  useEffect(() => {
    if (release?.revenueShareRecipients) {
      release.revenueShareRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority === wallet?.publicKey.toBase58()
        ) {
          setUserIsRecipient(true)
        }
      })
    }
  }, [release?.revenueShareRecipients, wallet?.connected])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && !metadata) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState?.metadata[releasePubkey]])

  useEffect(() => {}, [releaseState])

  useEffect(() => {
    const fetchHubs = async () => {
      const hubs = await getHubsForUser(wallet.publicKey.toBase58())

      setUserHubs(hubs)
    }
    if (wallet.connected && hubState && !userHubs) {
      fetchHubs()
    }
  }, [wallet?.connected, hubState])

  useEffect(() => {
    setUserHubs(null)
    setUserIsRecipient(false)
  }, [wallet?.disconnecting])

  if (metadata && Object.keys(metadata).length === 0) {
    return (
      <div>
        <h1>{`We're still preparing this release for sale, check back soon!`}</h1>
        <Button onClick={() => getRelease(releasePubkey)}>Refresh</Button>
      </div>
    )
  }

  if (!wallet?.connected && router.pathname.includes('releases')) {
    router.push(`/${releasePubkey}`)
  }

  return (
    <>
      <ReleaseWrapper>
        {!router.pathname.includes('market') && (
          <NinaBox columns={'repeat(2, 1fr)'} sx={{ backgroundColor: 'white' }}>
            <ReleaseCard
              metadata={metadata}
              preview={false}
              releasePubkey={releasePubkey}
              userHubs={userHubs}
              release={release}
              amountHeld={amountHeld}
              isAuthority={isAuthority}
              userIsRecipient={userIsRecipient}
            />
            <ReleaseCtaWrapper>
              <ReleasePurchase
                releasePubkey={releasePubkey}
                metadata={metadata}
                router={router}
                amountHeld={amountHeld}
                setAmountHeld={setAmountHeld}
                isAuthority={isAuthority}
              />
            </ReleaseCtaWrapper>
          </NinaBox>
        )}

        {router.pathname.includes('market') && (
          <NinaBox columns={'repeat(1, 1fr)'}>
            <ExchangeComponent
              releasePubkey={releasePubkey}
              exchanges={exchangeState.exchanges}
              metadata={metadata}
            />
          </NinaBox>
        )}
      </ReleaseWrapper>
    </>
  )
}

const ReleaseWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    overflowX: 'scroll',
    padding: '100px 0 160px',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
}))
const ReleaseCtaWrapper = styled(Box)(({ theme }) => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '0',
    width: '100%',
  },
}))

export default ReleaseComponent
