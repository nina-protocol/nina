import React, { useContext, useState, useEffect } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useSnackbar } from 'notistack'
import Dots from './Dots'


const Subscribe = (props) => {
  const {accountAddress} = props;
  const { subscriptionSubscribe, subscriptionUnsubscribe, userSubscriptions } = useContext(Nina.Context)
  const [isFollowing, setIsFollowing] = useState(false)
  const [pending, setPending] = useState(false)
  // const [followsYou, setFollowsYou] = useState(false)
  const { enqueueSnackbar } = useSnackbar()


  useEffect(() => {
    if (userSubscriptions) {
      const checkIfFollowing = userSubscriptions.some(subscription => subscription.to === accountAddress)
      console.log('checkIfFollowing :>> ', checkIfFollowing);
      setIsFollowing(checkIfFollowing)
    }

  }, [userSubscriptions])



  const handleSubscribe = async (accountAddress) => {
    console.log('accountAddress', accountAddress)
    setPending(true)
    const result = await subscriptionSubscribe(accountAddress, false)
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
    console.log('UNSUBE FROM', accountAddress);
    setPending(true)
    const result = await subscriptionUnsubscribe(accountAddress, false)
    console.log('result', result)
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

      {!isFollowing && !pending && (
        <Button
          color="primary"
          sx={{ padding: '0 15px' }}
          onClick={() => handleSubscribe(accountAddress)}
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
    </Box>
  )
}

export default Subscribe
