import React, { useContext, useState, useEffect, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import Link from 'next/link'

const Subscribe = ({
  accountAddress,
  hubHandle,
  inFeed = false,
  inHub = false,
}) => {
  const { wallet } = useContext(Wallet.Context)
  const router = useRouter()
  const {
    userSubscriptions,
    subscriptionSubscribeDelegated,
    subscriptionUnsubscribeDelegated,
  } = useContext(Nina.Context)
  const [pending, setPending] = useState(false)
  const [followsYou, setFollowsYou] = useState(false)
  const isFollowing = useMemo(() => {
    return userSubscriptions?.some(
      (subscription) => subscription.to.publicKey === accountAddress
    )
  }, [userSubscriptions, accountAddress])

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (wallet.connected && userSubscriptions) {
      const checkIfFollowsYou = userSubscriptions?.some(
        (subscription) => subscription.from === accountAddress
      )
      setFollowsYou(checkIfFollowsYou)
    }
  }, [userSubscriptions, wallet.connected])

  const handleSubscribe = async (e, accountAddress, hubHandle) => {
    e.preventDefault()
    e.stopPropagation()

    setPending(true)
    const result = await subscriptionSubscribeDelegated(
      accountAddress,
      hubHandle ? 'hub' : 'account',
      hubHandle
    )
    if (result.success) {
      enqueueSnackbar(result.msg, {
        variant: 'success',
      })
    } else {
      enqueueSnackbar('Error Following Account.', {
        variant: 'error',
      })
    }
    setPending(false)
  }

  const handleUnsubscribe = async (e, accountAddress, hubHandle) => {
    e.preventDefault()
    e.stopPropagation()

    setPending(true)

    const result = await subscriptionUnsubscribeDelegated(
      accountAddress,
      hubHandle
    )
    if (result.success) {
      enqueueSnackbar(result.msg, {
        variant: 'success',
      })
    } else {
      enqueueSnackbar('Error Unfollowing Account.', {
        variant: 'error',
      })
    }
    setPending(false)
  }

  return (
    <Box display="flex" alignItems={'center'}>
      {pending && (
        <Box sx={{ padding: '0 15px' }}>
          <Dots />
        </Box>
      )}
      {wallet.connected && wallet.publicKey.toBase58() !== accountAddress && (
        <>
          {!isFollowing && !pending && (
            <Button
              color="primary"
              sx={{ padding: `${inFeed ? '0px' : '0 15px'}` }}
              className="disableClickCapture"
              onClick={(e) => handleSubscribe(e, accountAddress, hubHandle)}
            >
              Follow
            </Button>
          )}

          {isFollowing && !pending && (
            <Button
              color="primary"
              sx={{ padding: `${inFeed ? '0px' : '0 15px'}` }}
              className="disableClickCapture"
              onClick={(e) => handleUnsubscribe(e, accountAddress, hubHandle)}
            >
              Unfollow
            </Button>
          )}

          {followsYou && (
            <Typography variant="body2" sx={{ padding: '0 15px' }}>
              Follows You
            </Typography>
          )}
        </>
      )}
    </Box>
  )
}

export default Subscribe
