import React, { useState, useContext, useEffect, useMemo } from 'react'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import Gates from '@nina-protocol/nina-internal-sdk/esm/Gates'
import PurchaseModal from '@nina-protocol/nina-internal-sdk/esm/PurchaseModal'

const NoSolWarning = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/NoSolWarning')
)
const RedeemReleaseCode = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/RedeemReleaseCode')
)
const HubsModal = dynamic(() => import('./HubsModal'))

const WalletConnectModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/WalletConnectModal')
)

import dynamic from 'next/dynamic'

const BUTTON_WIDTH = '155px'

const ReleasePurchase = (props) => {
  const {
    releasePubkey,
    metadata,
    inPost,
    hubPubkey,
    setAmountHeld,
    amountHeld,
  } = props
  const { enqueueSnackbar } = useSnackbar()
  const { wallet, pendingTransactionMessage } = useContext(Wallet.Context)
  const {
    releasePurchaseViaHub,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    gatesState,
    getRelease,
  } = useContext(Release.Context)
  const { hubState } = useContext(Hub.Context)
  const {
    collection,
    usdcBalance,
    ninaClient,
    checkIfHasBalanceToCompleteAction,
    solBalance,
    NinaProgramAction,
    getUserBalances,
  } = useContext(Nina.Context)
  const [release, setRelease] = useState(undefined)
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [publishedHub, setPublishedHub] = useState()
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

  useEffect(() => {
    getUserBalances()
  }, [])

  const isAuthority = useMemo(() => {
    if (wallet.connected) {
      return release?.authority === wallet?.publicKey.toBase58()
    }
  }, [release, wallet.connected])

  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey] || 0)
  }, [collection[releasePubkey]])

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

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
    }

    if (!wallet?.connected) {
      setShowWalletModal(true)
      logEvent('release_purchase_failure_not_connected', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
      })
      return
    }

    if (solBalance === 0) {
      setShowNoSolModal(true)
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
    release.remainingSupply > 0 || release.remainingSupply === -1
      ? `${
          release.price > 0
            ? `Buy ${ninaClient.nativeToUiString(
                release.price,
                release.paymentMint
              )}`
            : 'Collect For Free'
        }`
      : `Sold Out (${ninaClient
          .nativeToUi(release.price, release.paymentMint)
          .toFixed(2)})`

  const PurchaseModalButtonContents = () => (
    <BuyButtonTypography
      soldOut={release.remainingSupply === 0}
      variant="body2"
      align="left"
    >
      {(txPending || pending) && <Dots msg={pendingTransactionMessage} />}
      {!txPending && !pending && (
        <Typography variant="body2">{buttonText}</Typography>
      )}
    </BuyButtonTypography>
  )
  const onCoinflowSuccess = async () => {
    await getRelease(releasePubkey)
    enqueueSnackbar('Release purchased!', {
      variant: 'success',
    })
  }

  return (
    <ReleasePurchaseWrapper mt={1}>
      <NoSolWarning
        action="purchase"
        open={showNoSolModal}
        setOpen={setShowNoSolModal}
      />

      <WalletConnectModal
        inOnboardingFlow={false}
        forceOpen={showWalletModal}
        setForceOpen={setShowWalletModal}
        action={release.price > 0 ? 'purchase' : 'collect'}
      />

      <AmountRemaining variant="body2" align="left">
        {release.editionType === 'open' ? (
          <Typography variant="body2" align="left">
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
      <Box display="flex" flexDirection="column" justifyContent="space-between">
        <Box
          sx={{
            width: '50%',
          }}
        >
          <PurchaseModal
            release={release}
            metadata={metadata}
            releasePubkey={releasePubkey}
            payWithUSDC={handleSubmit}
            payWithCardCallback={onCoinflowSuccess}
            Contents={PurchaseModalButtonContents}
            showWalletModal={showWalletModal}
            setShowWalletModal={setShowWalletModal}
          />
        </Box>
        <Box
          sx={{
            width: '50%',
            marginTop: '10px',
          }}
        >
          <Gates
            release={release}
            metadata={metadata}
            releasePubkey={releasePubkey}
            isAuthority={isAuthority}
            amountHeld={amountHeld}
            inSettings={false}
            inHubs={true}
          />
          <Box sx={{ paddingTop: '8px' }}>
            {amountHeld === 0 && release.remainingSupply !== 0 && (
              <>
                {releaseGates?.length > 0 && (
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
              </>
            )}
          </Box>
        </Box>
      </Box>
    </ReleasePurchaseWrapper>
  )
}

const BuyButton = styled(Button)(({ theme, soldOut }) => ({
  border: soldOut
    ? `1px solid ${theme.palette.grey.primary}`
    : `1px solid ${theme.palette.text.primary}`,
  height: '55px',
  width: '100%',
  '& p': {
    padding: '10px',
    '&:hover': {
      opacity: '50%',
    },
  },
}))

const BuyButtonTypography = styled(Typography)(({ theme, soldOut }) => ({
  color: soldOut ? theme.palette.grey.primary : '',
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
const StyledTypographyButtonSub = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  textAlign: 'center',
  fontSize: '12px',
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
