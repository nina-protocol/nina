import { Button, Collapse, Fade, Menu, MenuItem, styled } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useMemo, useState } from 'react'
import {
  WalletDialogButton,
  useWalletDialog,
} from '@solana/wallet-adapter-material-ui'

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
  children,
  ...props
}) => {
  const { publicKey, wallet, disconnect } = useWallet()
  const { setOpen } = useWalletDialog()
  const [anchor, setAnchor] = useState()

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  const content = useMemo(() => {
    if (children) return children
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [children, wallet, base58])

  if (!wallet) {
    return (
      <WalletDialogButton
        color={color}
        variant={variant}
        type={type}
        {...props}
      >
        {children}
      </WalletDialogButton>
    )
  }

  return (
    <>
      <Button
        color={color}
        variant={variant}
        type={type}
        onClick={(event) => 
        {  console.log('event.currentTarget: ', event.currentTarget)
          setAnchor(event.currentTarget)}}
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
            {wallet.adapter.name}
          </Button>
        </WalletMenuItem>
        <Collapse in={!!anchor}>
          <WalletActionMenuItem
            onClick={async () => {
              setAnchor(undefined)
              router.push('/dashboard')
            }}
          >
            View Dashboard
          </WalletActionMenuItem>
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
              setOpen(true)
            }}
          >
            Change wallet
          </WalletActionMenuItem>
          <WalletActionMenuItem
            onClick={() => {
              setAnchor(undefined)
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              disconnect().catch(() => {
                // Silently catch because any errors are caught by the context `onError` handler
              })
            }}
          >
            Disconnect
          </WalletActionMenuItem>
        </Collapse>
      </StyledMenu>
    </>
  )
}

export default WalletButton
