import { Button, Collapse, Fade, Menu, MenuItem, styled } from '@mui/material'
import React, { useMemo, useState, useContext } from 'react'
import WalletConnectModal from './WalletConnectModal'
import Wallet from '../contexts/Wallet'

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiListItemIcon-root': {
    marginRight: theme.spacing(),
    minWidth: 'unset',
    '& .MuiSvgIcon-root': {
      width: 20,
      height: 20,
    },
  },
}))

const WalletActionMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  boxShadow: 'inset 0 1px 0 0 ' + 'rgba(255, 255, 255, 0.1)',

  '&:hover': {
    boxShadow:
      'inset 0 1px 0 0 ' +
      'rgba(255, 255, 255, 0.1)' +
      ', 0 1px 0 0 ' +
      'rgba(255, 255, 255, 0.05)',
  },
}))

const WalletMenuItem = styled(WalletActionMenuItem)(() => ({
  padding: 0,

  '& .MuiButton-root': {
    borderRadius: 0,
  },
}))

const WalletButton = ({
  color = 'primary',
  variant = 'contained',
  type = 'button',
  router,
  inHubs,
  children,
  ...props
}) => {
  const { wallet } = useContext(Wallet.Context)
  const [anchor, setAnchor] = useState()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const base58 = useMemo(() => wallet.publicKey?.toBase58(), [wallet.publicKey])
  const content = useMemo(() => {
    if (children) return children
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [children, wallet, base58])

  if (!wallet.wallet) {
    return (
      <WalletConnectModal
        inOnboardingFlow={false}
        walletConnectPrompt={false}
        forceOpen={showWalletModal}
        setForceOpen={setShowWalletModal}
      >
        {children}
      </WalletConnectModal>
    )
  }
  return (
    <>
      <Button
        color={color}
        variant={variant}
        type={type}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-controls="wallet-menu"
        aria-haspopup="true"
        {...props}
      >
        {content}
      </Button>
      <StyledMenu
        id="wallet-menu"
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(undefined)}
        marginThreshold={0}
        TransitionComponent={Fade}
        transitionDuration={250}
        keepMounted
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <WalletMenuItem onClick={() => setAnchor(undefined)}>
          <Button
            color={color}
            variant={variant}
            type={type}
            onClick={() => setAnchor(undefined)}
            fullWidth
            {...props}
          >
            {wallet.wallet.adapter.name}
          </Button>
        </WalletMenuItem>
        <Collapse in={!!anchor}>
          {!inHubs && (
            <WalletActionMenuItem
              onClick={async () => {
                setAnchor(undefined)
                router.push('/dashboard')
              }}
            >
              View Dashboard
            </WalletActionMenuItem>
          )}
          <WalletActionMenuItem
            onClick={async () => {
              setAnchor(undefined)
              await navigator.clipboard.writeText(base58)
            }}
          >
            Copy address
          </WalletActionMenuItem>
          <WalletActionMenuItem
            onClick={() => {
              setAnchor(undefined)
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              wallet.disconnect().catch(() => {
                // Silently catch because any errors are caught by the context `onError` handler
              })
            }}
          >
            Sign Out
          </WalletActionMenuItem>
        </Collapse>
      </StyledMenu>
    </>
  )
}

export default WalletButton
