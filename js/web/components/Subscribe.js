import React, { useContext, useState, useEffect, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import Dots from './Dots'
import Link from 'next/link'

const Subscribe = (props) => {
  const {accountAddress , hubHandle} = props;
  const { subscriptionSubscribe, subscriptionUnsubscribe, userSubscriptions, getSubscriptionsForUser, subscriptionState } = useContext(Nina.Context)
  const [isFollowing, setIsFollowing] = useState(false)
  const [pending, setPending] = useState(false)
  const [targetSubscriptions, setTargetSubscriptions] = useState()
  const [followsYou, setFollowsYou] = useState(false)
  const [isUser, setIsUser] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()


  useEffect(() => {
    const handleSubscriptions = async (accountAddress) => {
      const subscriptions = await getSubscriptionsForUser(accountAddress)
      setTargetSubscriptions(subscriptions)
    }
    handleSubscriptions(accountAddress)
  }, [])

  useEffect(() => {
    if (userSubscriptions) {
      const checkIfFollowing = userSubscriptions.some(subscription => subscription.to === accountAddress)
      setIsFollowing(checkIfFollowing)
    }
  }, [userSubscriptions])

  useEffect(() => {
    if (wallet.publicKey) {
      setIsUser(wallet.publicKey.toBase58() === accountAddress)
    }
    if (wallet.connected && targetSubscriptions) {
      const checkIfFollowsYou = targetSubscriptions?.some(subscription => subscription.to === wallet.publicKey.toBase58())
      setFollowsYou(checkIfFollowsYou)
    }
  }, [targetSubscriptions, wallet.connected])

  const handleSubscribe = async (accountAddress, hubHandle) => {
    setPending(true)
    const result = await subscriptionSubscribe(accountAddress, hubHandle)
    console.log('result', result)
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

  const handleUnsubscribe = async (accountAddress) => {
    setPending(true)
    const result = await subscriptionUnsubscribe(accountAddress)
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
    <Box display='flex'>
      {pending && (
        <Box sx={{ padding: '0 15px'}}>
          <Dots />
        </Box>
      )}

      {isUser ? (
        <Box sx={{ padding: '0 15px'}}>
          <Typography>This is your profile. Click <Link href="/dashboard"><a style={{textDecoration: 'underline'}}>here</a></Link> to see your dashboard</Typography>
        </Box>
      )
      :
      (
        <>
          {!isFollowing && !pending && (
            <Button
              color="primary"
              sx={{ padding: '0 15px' }}
              onClick={() => handleSubscribe(accountAddress, hubHandle)}
            >
              Follow
            </Button>
          )}

          {isFollowing && !pending && (
            <Button
              color="primary"
              sx={{ padding: '0 15px' }}
              onClick={() => handleUnsubscribe(accountAddress)}
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
