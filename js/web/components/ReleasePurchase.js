import React, { useEffect, useState, useMemo, useContext, createElement, Fragment } from 'react'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { Typography } from '@mui/material'
import Link from 'next/link'
import nina from '@nina-protocol/nina-sdk'
import CollectorModal from './CollectorModal'
import HubsModal from './HubsModal'
import Dots from './Dots'
import ReleaseSettings from './ReleaseSettings'
import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";


const { ReleaseContext, NinaContext, ExchangeContext } = nina.contexts

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, router, relatedReleases } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const {
    releasePurchase,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    getRelease,
    getPublishedHubForRelease,
  } = useContext(ReleaseContext)
  const { getAmountHeld, collection, ninaClient, usdcBalance } = useContext(NinaContext)
  const {
    exchangeState,
    filterExchangesForReleaseBuySell,
    getExchangesForRelease,
  } = useContext(ExchangeContext)
  const [release, setRelease] = useState(undefined)
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)
  const [downloadButtonString, setDownloadButtonString] = useState('Download')
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [exchangeTotalBuys, setExchangeTotalBuys] = useState(0)
  const [exchangeTotalSells, setExchangeTotalSells] = useState(0)
  const [publishedHub, setPublishedHub] = useState()
  const [description, setDescription] = useState()
  const txPending = useMemo(() => releasePurchaseTransactionPending[releasePubkey], [releasePubkey, releasePurchaseTransactionPending])
  const pending = useMemo(() => releasePurchasePending[releasePubkey], [releasePubkey, releasePurchasePending])

  useEffect(() => {
    getRelease(releasePubkey)
    getExchangesForRelease(releasePubkey)

    const hubForRelease = async (releasePubkey) => {
      const result = await getPublishedHubForRelease(releasePubkey)
      setPublishedHub(result?.hub)
    }
    hubForRelease(releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
  }, [])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey])
  }, [collection[releasePubkey]])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    setAmountPendingBuys(
      filterExchangesForReleaseBuySell(releasePubkey, true, true).length
    )
    setAmountPendingSales(
      filterExchangesForReleaseBuySell(releasePubkey, false, true).length
    )
    setExchangeTotalBuys(
      filterExchangesForReleaseBuySell(releasePubkey, true, false).length
    )
    setExchangeTotalSells(
      filterExchangesForReleaseBuySell(releasePubkey, false, false).length
    )
  }, [exchangeState])

  useEffect(() => {
    if (release?.royaltyRecipients) {
      release.royaltyRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority.toBase58() ===
            wallet?.publicKey.toBase58()
        ) {
          setUserIsRecipient(true)
        }
      })
    }
  }, [release?.royaltyRecipients, wallet?.connected])

  useEffect(() => {
    if (metadata?.description.includes('<p>')) {
      unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ["nofollow", "noreferrer"],
        })
        .process(
          JSON.parse(metadata.description).replaceAll(
            "<p><br></p>",
            "<br>"
          )
        )
        .then((file) => {
          setDescription(file.result);
        });
    } else {
      console.log('normal description');
      setDescription(metadata.description)
    }
  }, [metadata?.description]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result

    if (!release.pending) {
      if (!ninaClient.isSol(release.paymentMint) && usdcBalance < ninaClient.nativeToUi(release.price.toNumber(), ninaClient.ids.mints.usdc)) {
        enqueueSnackbar('Calculating SOL - USDC Swap...', {
          variant: 'info',
        })
      } else {
        enqueueSnackbar('Preparing transaction...', {
          variant: 'info',
        })
      }
      result = await releasePurchase(releasePubkey)
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
      ? `Buy $${ninaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}`
      : `Sold Out ($${ninaClient
          .nativeToUi(release.price.toNumber(), release.paymentMint)
          .toFixed(2)})`

  const buttonDisabled =
    wallet?.connected && release.remainingSupply > 0 ? false : true

  let pathString = ''
  if (router.pathname.includes('releases')) {
    pathString = '/releases'
  } else if (router.pathname.includes('collection')) {
    pathString = '/collection'
  }

  const downloadAs = async (url, name) => {
    setDownloadButtonString('Downloading')

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
    <Box>
      <AmountRemaining variant="body2" align="left">
        Remaining: <span>{release.remainingSupply.toNumber()} </span> /{' '}
        {release.totalSupply.toNumber()}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage.toNumber() / 10000}%
      </Typography>
      <Typography variant="body2" align="left" paddingBottom="10px">
        {' '}
        <StyledLink href={`${pathString}/${releasePubkey}/market`} passHref>
          {`View Secondary Market (${exchangeTotalBuys + exchangeTotalSells})`}
        </StyledLink>
      </Typography>
      <CollectorModal releasePubkey={releasePubkey} metadata={metadata} />
      <HubsModal releasePubkey={releasePubkey} metadata={metadata} />
      {wallet?.connected && (
        <StyledUserAmount>
          {metadata && (
            <Typography variant="body2" align="left" gutterBottom>
              You have: {amountHeld || 0} {metadata.symbol}
            </Typography>
          )}
          {amountPendingSales > 0 ? (
            <Typography variant="body2" align="left" gutterBottom>
              {amountPendingSales} pending sale
              {amountPendingSales > 1 ? 's' : ''}{' '}
            </Typography>
          ) : null}
          {amountPendingBuys > 0 ? (
            <Typography variant="body2" align="left" gutterBottom>
              {amountPendingBuys} pending buy
              {amountPendingBuys > 1 ? 's' : ''}{' '}
            </Typography>
          ) : null}
        </StyledUserAmount>
      )}
      {publishedHub && (
        <Typography variant="body2" align="left" paddingBottom="10px">
          <StyledLink
            href={publishedHub.json.externalUrl}
            target="_blank"
            rel="noreferrer"
            passHref
          >
            {`Published via ${publishedHub.json.displayName}`}
          </StyledLink>
        </Typography>
      )}
      <StyledDescription variant="body1" align="left">
        {description}
      </StyledDescription>
      {wallet?.connected && userIsRecipient && (
        <ReleaseSettings releasePubkey={releasePubkey} inCreateFlow={false} />
      )}
      <Box mt={1}>
        <form onSubmit={handleSubmit}>
          <Button
            variant="outlined"
            type="submit"
            disabled={buttonDisabled}
            fullWidth
          >
            <Typography variant="body2">
              {txPending &&
                <Dots msg="preparing transaction" />
              }
              {!txPending && pending &&
                <Dots msg="awaiting wallet approval" />
              }
              {!txPending && !pending &&
                buttonText
              }
            </Typography>
          </Button>
        </form>
      </Box>
      {relatedReleases && relatedReleases.length > 1 && (
        <Link href={`/${releasePubkey}/related`} passHref>
          <Button
            variant="outlined"
            fullWidth
            sx={{ marginTop: '15px !important' }}
          >
            <Typography variant="body2">
              See {relatedReleases.length - 1} more related release
              {relatedReleases.length - 1 > 1 ? 's' : ''}
            </Typography>
          </Button>
        </Link>
      )}
      {amountHeld > 0 && (
        <Button
          variant="outlined"
          fullWidth
          sx={{ marginTop: '15px !important' }}
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
          <Typography variant="body2">
            {downloadButtonString === 'Download' ? (
              'Download'
            ) : (
              <Dots msg={downloadButtonString} />
            )}
          </Typography>
        </Button>
      )}
    </Box>
  )
}

const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: '10px',
  '& span': {
    color: theme.palette.blue,
  },
}))

const StyledLink = styled(Link)(() => ({
  '&:hover': {
    cursor: 'pointer',
    opacity: '0.5 !import',
  },
}))
const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
}))

const StyledDescription = styled(Typography)(({ theme }) => ({
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    maxHeight: '152px',
    overflowY: 'scroll',
  },
}))

export default ReleasePurchase
