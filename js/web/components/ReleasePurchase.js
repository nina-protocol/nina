import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  createElement,
  Fragment,
} from 'react'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import { encodeBase64 } from 'tweetnacl-util';
import CollectorModal from './CollectorModal'
import HubsModal from './HubsModal'
import Dots from './Dots'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import Royalty from './Royalty'
import CreateGateModal from './CreateGateModal'
import UnlockGateModal from './UnlockGateModal'
import { parseChecker } from '@nina-protocol/nina-internal-sdk/esm/utils'

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, router } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const {
    releasePurchase,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    getRelease,
  } = useContext(Release.Context)
  const {
    getAmountHeld,
    collection,
    ninaClient,
    usdcBalance,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)
  const {
    exchangeState,
    filterExchangesForReleaseBuySell,
    getExchangesForRelease,
  } = useContext(Exchange.Context)
  const [release, setRelease] = useState(undefined)
  const [gate, setGate] = useState(undefined)
  // const [file, setFile] = useState(undefined)
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)
  const [downloadButtonString, setDownloadButtonString] = useState('Download')
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [exchangeTotalBuys, setExchangeTotalBuys] = useState(0)
  const [exchangeTotalSells, setExchangeTotalSells] = useState(0)
  const [publishedHub, setPublishedHub] = useState()
  const [description, setDescription] = useState()
  const txPending = useMemo(
    () => releasePurchaseTransactionPending[releasePubkey],
    [releasePubkey, releasePurchaseTransactionPending]
  )
  const pending = useMemo(
    () => releasePurchasePending[releasePubkey],
    [releasePubkey, releasePurchasePending]
  )


  const getGate = async () => {
    const {gates} = (await axios.get(`${process.env.NINA_GATE_URL}/releases/${releasePubkey}/gates`)).data
    if (gates.length > 0) {
      setGate(gates[0])
    }
  }

  useEffect(() => {
    getRelease(releasePubkey)
    getGate()
    console.log('gate :>> ', gate);
    // const hubForRelease = async (releasePubkey) => {
    //   const result = await getPublishedHubForRelease(releasePubkey)
    //   setPublishedHub(result?.hub)
    // }
    // hubForRelease(releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    getExchangesForRelease(releasePubkey)
  }, [releasePubkey, wallet.connected])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey] || 0)
  }, [collection[releasePubkey]])

  // useEffect(() => {
  //   const handleGetAmountHeld = async () => {
  //     const amountHeld = await getAmountHeld(
  //       releaseState.releaseMintMap[releasePubkey],
  //       releasePubkey
  //     )
  //     console.log('amountHeld !!:>> ', amountHeld);
  //     setAmountHeld(amountHeld)
  //   }
  // handleGetAmountHeld()
  // }, [releasePubkey])

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
    if (metadata?.descriptionHtml) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(parseChecker(metadata.descriptionHtml))
        .then((file) => {
          setDescription(file.result)
        })
    } else {
      setDescription(metadata?.description)
    }
  }, [metadata?.description])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!wallet?.connected) {
      enqueueSnackbar('Please connect your wallet to purchase', {
        variant: 'error',
      })
      logEvent('release_purchase_failure_not_connected', 'engagement', {
        publicKey: releasePubkey,
      })
      return
    }
    let result
    if (!amountHeld || amountHeld === 0) {
      const error = await checkIfHasBalanceToCompleteAction(
        NinaProgramAction.RELEASE_PURCHASE
      )
      if (error) {
        enqueueSnackbar(error.msg, { variant: 'failure' })
        return
      }
    }

    if (!release.pending) {
      if (
        !ninaClient.isSol(release.paymentMint) &&
        usdcBalance <
          ninaClient.nativeToUi(release.price, ninaClient.ids.mints.usdc)
      ) {
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
          release.price,
          release.paymentMint
        )}`
      : `Sold Out ($${ninaClient
          .nativeToUi(release.price, release.paymentMint)
          .toFixed(2)})`

  let pathString = ''
  if (router.pathname.includes('releases')) {
    pathString = '/releases'
  } else if (router.pathname.includes('collection')) {
    pathString = '/collection'
  }

  const downloadAs = async (url, name) => {
    setDownloadButtonString('Downloading')

    logEvent('track_download', 'engagement', {
      publicKey: releasePubkey,
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
    <Box>
      <AmountRemaining variant="body2" align="left">
        Remaining: <span>{release.remainingSupply} </span> /{' '}
        {release.totalSupply}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage / 10000}%
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
            <>
              <Typography
                variant="body2"
                align="left"
                gutterBottom
                paddingBottom={'5px'}
                cursor="default"
              >
                {`Catalog no. ${metadata.symbol}`}
              </Typography>
              <Typography
                variant="body2"
                align="left"
                gutterBottom
                cursor="default"
              >
                {amountHeld > 0 &&
                  `You own ${
                    amountHeld > 1 ? `${amountHeld} editions of` : ''
                  } this release`}
              </Typography>
            </>
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
            href={`/hubs/${publishedHub.publicKey}`}
            target="_blank"
            rel="noreferrer"
            passHref
          >
            {`Published via ${publishedHub.data.displayName}`}
          </StyledLink>
        </Typography>
      )}
      <StyledDescription align="left">{description}</StyledDescription>
      {/* {gate && (
        <UnlockGateModal gate={gate} releasePubkey={releasePubkey} amountHeld={amountHeld} />
      )} */}
      <Box mt={1}>
        <form onSubmit={handleSubmit}>
          <Button variant="outlined" type="submit" fullWidth>
            <Typography variant="body2">
              {txPending && <Dots msg="preparing transaction" />}
              {!txPending && pending && <Dots msg="awaiting wallet approval" />}
              {!txPending && !pending && buttonText}
            </Typography>
          </Button>
        </form>
      </Box>
      {gate && (
        <UnlockGateModal gate={gate} releasePubkey={releasePubkey} amountHeld={amountHeld} />
      )}
      {!gate && wallet?.publicKey?.toBase58() === release.authority && (
        <>
          <CreateGateModal releasePubkey={releasePubkey} getGate={getGate} metadata={metadata} />
        </>
      )}
  
      {/* {userIsRecipient && (
        <Royalty releasePubkey={releasePubkey} release={release} />
      )} */}
      {/* {amountHeld > 0 && (
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
      )} */}
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
  fontSize: '18px !important',
  lineHeight: '20.7px !important',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.up('md')]: {
    maxHeight: '152px',
    overflowY: 'scroll',
    height: '152px',
  },
}))

export default ReleasePurchase
