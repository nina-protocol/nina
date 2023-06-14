import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  createElement,
  Fragment,
} from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import CollectorModal from './CollectorModal'
import HubsModal from './HubsModal'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import { parseChecker } from '@nina-protocol/nina-internal-sdk/esm/utils'
import dynamic from 'next/dynamic'
import AddToHubModal from '@nina-protocol/nina-internal-sdk/esm/AddToHubModal'
const Gates = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/Gates')
)
const RedeemReleaseCode = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/RedeemReleaseCode')
)

const NoSolWarning = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/NoSolWarning')
)

const WalletConnectModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/WalletConnectModal')
)

const ReleasePurchase = (props) => {
  const {
    releasePubkey,
    metadata,
    router,
    amountHeld,
    setAmountHeld,
    isAuthority,
  } = props

  const { enqueueSnackbar } = useSnackbar()
  const { wallet, pendingTransactionMessage } = useContext(Wallet.Context)
  const {
    releasePurchase,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    getRelease,
    gatesState,
  } = useContext(Release.Context)
  const {
    getAmountHeld,
    collection,
    ninaClient,
    usdcBalance,
    solBalance,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)
  const {
    exchangeState,
    filterExchangesForReleaseBuySell,
    getExchangesForRelease,
  } = useContext(Exchange.Context)
  const [release, setRelease] = useState(undefined)
  const [code, setCode] = useState()
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)
  const [exchangeTotalBuys, setExchangeTotalBuys] = useState(0)
  const [exchangeTotalSells, setExchangeTotalSells] = useState(0)
  const [publishedHub, setPublishedHub] = useState()
  const [description, setDescription] = useState()
  const [showNoSolModal, setShowNoSolModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const txPending = useMemo(
    () => releasePurchaseTransactionPending[releasePubkey],
    [releasePubkey, releasePurchaseTransactionPending]
  )
  const pending = useMemo(
    () => releasePurchasePending[releasePubkey],
    [releasePubkey, releasePurchasePending]
  )

  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )

  useEffect(() => {
    getRelease(releasePubkey)
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
    const handleFetchAmount = async () => {
      const amount = await getAmountHeld(
        releaseState.releaseMintMap[releasePubkey],
        releasePubkey
      )
      setAmountHeld(amount)
    }
    handleFetchAmount()
  }, [releasePubkey, releaseState.releaseMintMap, collection])

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
      setShowWalletModal(true)
      logEvent('release_purchase_failure_not_connected', 'engagement', {
        publicKey: releasePubkey,
      })
      return
    }

    if (release.price > 0 && solBalance === 0) {
      setShowNoSolModal(true)
      return
    }

    let result
    if ((!amountHeld || amountHeld === 0) && release.price > 0) {
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
    release.remainingSupply > 0 || release.remainingSupply === -1
      ? `${
          release.price > 0
            ? `Buy ${ninaClient.nativeToUiString(
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

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {release.price > 0 && (
        <NoSolWarning
          requiredSol={ninaClient.nativeToUiString(
            release.price,
            release.paymentMint
          )}
          action={'purchase'}
          open={showNoSolModal}
          setOpen={setShowNoSolModal}
        />
      )}

      <WalletConnectModal
        inOnboardingFlow={false}
        forceOpen={showWalletModal}
        setForceOpen={setShowWalletModal}
        action={release.price > 0 ? 'purchase' : 'collect'}
      />

      <Box>
        <AmountRemaining variant="body2" align="left">
          {release.editionType === 'open' ? (
            <Typography
              variant="body2"
              align="left"
              sx={{ color: '#black !important' }}
            >
              Open Edition:{' '}
              {`${release?.saleCounter > 0 ? release?.saleCounter : 0} Collected`}
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
            {`View Secondary Market (${
              exchangeTotalBuys + exchangeTotalSells
            })`}
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
        <StyledDescription align="left" releaseGates={releaseGates}>
          {description}
        </StyledDescription>
      </Box>
      <Box
        sx={{
          position: { xs: 'relative', md: 'absolute' },
          bottom: '0',
          width: '100%',
          background: 'white',
        }}
      >
        <Box sx={{ mt: 1 }}>
          <form onSubmit={handleSubmit}>
            <Button
              variant="outlined"
              type="submit"
              fullWidth
              disabled={release.remainingSupply === 0 ? true : false}
            >
              <Typography variant="body2">
                {(txPending || pending) && (
                  <Dots msg={pendingTransactionMessage} />
                )}
                {!txPending && !pending && (
                  <Typography variant="body2">{buttonText}</Typography>
                )}
              </Typography>
            </Button>
          </form>
        </Box>
        <Gates
          release={release}
          metadata={metadata}
          releasePubkey={releasePubkey}
          isAuthority={isAuthority}
          amountHeld={amountHeld}
          inSettings={false}
          releaseGates={releaseGates}
        />
        {amountHeld === 0 && release.remainingSupply !== 0 && (
          <GatesNotification gates={releaseGates?.length}>
            {releaseGates && (
              <StyledTypographyButtonSub>
                {`There ${releaseGates?.length > 1 ? 'are' : 'is'} ${
                  releaseGates?.length
                } ${
                  releaseGates?.length > 1 ? 'files' : 'file'
                } available for download exclusively to owners of this release.`}
              </StyledTypographyButtonSub>
            )}

            {release.price > 0 && (
              <RedeemReleaseCode releasePubkey={releasePubkey} />
            )}
          </GatesNotification>
        )}
      </Box>
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

const StyledTypographyButtonSub = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  textAlign: 'center',
  fontSize: '12px',
}))

const StyledDescription = styled(Typography)(({ theme, releaseGates }) => ({
  overflowWrap: 'anywhere',
  fontSize: '18px !important',
  lineHeight: '20.7px !important',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '& pre': {
    whiteSpace: 'pre-wrap',
  },
  [theme.breakpoints.up('md')]: {
    maxHeight: releaseGates ? '182px' : '256px',
    overflowY: 'scroll',
  },
}))

const GatesNotification = styled(Box)(({ theme, gates }) => ({
  alignItems: 'center',
  position: 'absolute',
  top: '110%',
  width: gates ? 'auto' : '100%',
}))

export default ReleasePurchase
