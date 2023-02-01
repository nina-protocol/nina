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
import CollectorModal from './CollectorModal'
import HubsModal from './HubsModal'
import Dots from './Dots'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import Royalty from './Royalty'
import { parseChecker } from '@nina-protocol/nina-internal-sdk/esm/utils'
import dynamic from 'next/dynamic'
const CloseRelease = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/CloseRelease')
)
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
    closeRelease,
    getCollectorsForRelease,
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
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)
  const [downloadButtonString, setDownloadButtonString] = useState('Download')
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [exchangeTotalBuys, setExchangeTotalBuys] = useState(0)
  const [exchangeTotalSells, setExchangeTotalSells] = useState(0)
  const [publishedHub, setPublishedHub] = useState()
  const [description, setDescription] = useState()
  const [showCloseReleaseModal, setShowCloseReleaseModal] = useState(false)
  const [pendingTx, setPendingTx] = useState(false)
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
    getRelease(releasePubkey)
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

  const handleCloseRelease = async (e, releasePubkey) => {
    e.preventDefault()
    setPendingTx(true)
    const result = await closeRelease(releasePubkey)

    if (result) {
      showCompletedTransaction(result)
      setPendingTx(false)
      setShowCloseReleaseModal(false)
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
    release.remainingSupply > 0 || release.remainingSupply === -1
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
        {release.editionType === 'open' ? (
          <Typography
            variant="body2"
            align="left"
            sx={{ color: '#black !important' }}
          >
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
      <Box mt={1}>
        <form onSubmit={handleSubmit}>
          <Button
            variant="outlined"
            type="submit"
            fullWidth
            disabled={release.remainingSupply === 0 ? true : false}
          >
            <Typography variant="body2">
              {txPending && <Dots msg="preparing transaction" />}
              {!txPending && pending && <Dots msg="awaiting wallet approval" />}
              {!txPending && !pending && buttonText}
            </Typography>
          </Button>
        </form>
      </Box>
      {userIsRecipient && (
        <>
          <Royalty releasePubkey={releasePubkey} release={release} />
          {(release.remainingSupply > 0 || release.remainingSupply === -1) && (
            <CloseRelease
              handleCloseRelease={(e) => handleCloseRelease(e, releasePubkey)}
              pendingTx={pendingTx}
              release={release}
              inHubs={false}
              fullWidth={true}
            />
          )}
        </>
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
