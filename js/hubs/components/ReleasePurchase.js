import React, { useState, useContext, useEffect, useMemo } from 'react'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Dots from './Dots'
import Royalty from './Royalty'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'

const HubsModal = dynamic(() => import('./HubsModal'))

import dynamic from 'next/dynamic'

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, inPost, hubPubkey } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const router = useRouter()
  const {
    releasePurchaseViaHub,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    getCollectorsForRelease,
  } = useContext(Release.Context)
  const { hubState } = useContext(Hub.Context)
  const {
    getAmountHeld,
    collection,
    usdcBalance,
    ninaClient,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)
  const [release, setRelease] = useState(undefined)
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [downloadButtonString, setDownloadButtonString] = useState('Download')
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [publishedHub, setPublishedHub] = useState()
  const [collectors, setCollectors] = useState()
  const txPending = useMemo(
    () => releasePurchaseTransactionPending[releasePubkey],
    [releasePubkey, releasePurchaseTransactionPending]
  )
  const pending = useMemo(
    () => releasePurchasePending[releasePubkey],
    [releasePubkey, releasePurchasePending]
  )

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey])
  }, [collection, releasePubkey])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)

    // const hubForRelease = async (releasePubkey) => {
    //   const result = await getPublishedHubForRelease(releasePubkey);
    //   setPublishedHub(result?.hub);
    // };
    // hubForRelease(releasePubkey);
  }, [releasePubkey, releaseState.releaseMintMap])

  useEffect(() => {
    if (release?.royaltyRecipients) {
      release.royaltyRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority === wallet?.publicKey.toBase58() &&
          recipient.percentShare / 10000 > 0
        ) {
          setUserIsRecipient(true)
        }
      })
    }
  }, [release?.royaltyRecipients, wallet?.connected, wallet?.publicKey])

  useEffect(() => {
    handleGetCollectorsForRelease(releasePubkey)
  }, [collection])

  const handleGetCollectorsForRelease = async (releasePubkey) => {
    const collectorsList = await getCollectorsForRelease(releasePubkey)

    if (wallet?.publicKey) {
      const walletPublicKey = wallet.publicKey.toBase58()
      if (
        collection[releasePubkey] > 0 &&
        !collectorsList.includes(walletPublicKey)
      ) {
        collectorsList.push(walletPublicKey)
      } else if (
        collectorsList.includes(walletPublicKey) &&
        collection[releasePubkey] <= 0
      ) {
        const index = collectorsList.indexOf(walletPublicKey)
        if (index > -1) {
          collectorsList.splice(index, 1)
        }
      }
    }
    setCollectors(collectorsList)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!wallet?.connected) {
      enqueueSnackbar('Please connect your wallet to purchase', {
        variant: 'error',
      })
      logEvent('release_purchase_failure_not_connected', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
      })
      return
    }

    let result
    const error = await checkIfHasBalanceToCompleteAction(
      NinaProgramAction.RELEASE_PURCHASE_VIA_HUB
    )
    if (error) {
      enqueueSnackbar(error.msg, { variant: 'failure' })
      return
    }
    if (!release.pending) {
      let releasePriceUi = ninaClient.nativeToUi(
        release.price,
        ninaClient.ids.mints.usdc
      )
      let convertAmount =
        releasePriceUi +
        (releasePriceUi * hubState[hubPubkey].referralFee) / 100
      if (
        !ninaClient.isSol(release.releaseMint) &&
        usdcBalance < convertAmount
      ) {
        enqueueSnackbar('Calculating SOL - USDC Swap...', {
          variant: 'info',
        })
      } else {
        enqueueSnackbar('Preparing transaction...', {
          variant: 'info',
        })
      }
      result = await releasePurchaseViaHub(releasePubkey, hubPubkey)
      if (result) {
        showCompletedTransaction(result)
      }
    }
  }

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'success' : 'warn',
    })
  }

  if (!release) {
    return (
      <>
        <Dots color="inherit" />
      </>
    )
  }

  const buttonText =
    release.remainingSupply > 0
      ? `${
          release.price > 0
            ? `Buy $${ninaClient.nativeToUiString(
                release.price,
                release.paymentMint
              )}`
            : 'Collect For Free'
        }`
      : `Sold Out ($${ninaClient
          .nativeToUi(release.price, release.paymentMint)
          .toFixed(2)})`

  const downloadAs = async (url, name) => {
    setDownloadButtonString('Downloading')

    logEvent('track_download', 'engagement', {
      publicKey: releasePubkey,
      hub: hubPubkey,
      wallet: wallet?.publicKey?.toBase58(),
    })

    const response = await axios.get(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'blob',
    })
    if (response?.data) {
      const a = document.createElement('a')
      const url = window.URL.createObjectURL(response.data)
      a.href = url
      a.download = name
      a.click()
    }
    setDownloadButtonString('Download')
  }

  return (
    <ReleasePurchaseWrapper mt={1}>
      <AmountRemaining variant="body2" align="left">
        {release.editionType === 'open' ? (
          <Typography variant="body2" align="left">
            Open Edition:{' '}
            {`${collectors?.length ? collectors?.length : 0} Sold`}
          </Typography>
        ) : (
          <>
            Remaining: <span>{release.remainingSupply} </span> /{' '}
            {release.totalSupply}
          </>
        )}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage / 10000}%
      </Typography>
      {wallet?.connected && amountHeld > 0 && (
        <StyledUserAmount>
          {metadata && (
            <Typography variant="body2" align="left">
              You have: {amountHeld || 0} {metadata.symbol}
            </Typography>
          )}
        </StyledUserAmount>
      )}
      {publishedHub && publishedHub.id !== hubPubkey && (
        <Typography variant="body2" align="left" paddingBottom="10px">
          <StyledLink href={`/${publishedHub.handle}`}>
            {`Published via ${publishedHub.json.displayName}`}
          </StyledLink>
        </Typography>
      )}
      <HubsModal releasePubkey={releasePubkey} metadata={metadata} />
      {userIsRecipient && (
        <>
          <Royalty releasePubkey={releasePubkey} release={release} />
        </>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          textAlign: 'left',
          marginBottom: '10px',
          marginTop: { md: '0px', lg: '20px' },
        }}
      >
        <BuyButton
          variant="contained"
          type="submit"
          disabled={
            release.remainingSupply > 0 || release.remainingSupply === -1
              ? false
              : true
          }
        >
          <Typography variant="body2" align="left">
            {txPending && <Dots msg="Preparing transaction" />}
            {!txPending && pending && <Dots msg="Awaiting wallet approval" />}
            {!txPending && !pending && buttonText}
          </Typography>
        </BuyButton>
      </form>

      {amountHeld > 0 && (
        <BuyButton
          variant="contained"
          sx={{ marginBottom: '10px !important' }}
          onClick={(e) => {
            e.stopPropagation()
            downloadAs(
              metadata.properties.files[0].uri,
              `${metadata.name
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()}___nina.mp3`
            )
          }}
        >
          <Typography variant="body2" align="left">
            {downloadButtonString === 'Download' ? (
              'Download'
            ) : (
              <Dots msg={downloadButtonString} />
            )}
          </Typography>
        </BuyButton>
      )}
    </ReleasePurchaseWrapper>
  )
}

const BuyButton = styled(Button)(({ theme }) => ({
  '& p': {
    border: `1px solid ${theme.palette.text.primary}`,
    padding: '10px',
    '&:hover': {
      opacity: '50%',
    },
  },
}))
const ReleasePurchaseWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {},
}))
const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: '10px',
  '& span': {
    color: theme.palette.text.primary,
  },
}))

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
}))
const StyledLink = styled(Link)(() => ({
  '&:hover': {
    cursor: 'pointer',
    opacity: '0.5 !import',
  },
  textDecoration: 'none',
}))

export default ReleasePurchase
