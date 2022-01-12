import React, { useContext, useEffect, useState } from 'react'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Tweet } from 'react-twitter-widgets'
import Button from '@mui/material/Button'

const { NameContext } = ninaCommon.utils

const TwitterVerification = () => {
  const wallet = useWallet()
  const {
    findRegistrationTweet,
    lookupUserTwitterHandle,
    registerTwitterHandle,
    userTwitterHandle,
  } = useContext(NameContext)
  const [info, setInfo] = useState(null)
  const [twitterHandle, setTwitterHandle] = useState(null)

  useEffect(() => {
    if (wallet?.connected) {
      lookupUserTwitterHandle()
    }
  }, [wallet])

  useEffect(() => {
    setTwitterHandle(userTwitterHandle)
  }, [userTwitterHandle])

  const handleTweetButton = (e) => {
    e.preventDefault()

    window.open(
      `https://twitter.com/intent/tweet?text=${wallet?.publicKey.toBase58()}`,
      null,
      'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
    )
  }

  const handleVerificationCheck = async (e) => {
    e.preventDefault()

    const tweet = await findRegistrationTweet()
    setInfo(tweet)
  }

  const handleRegistration = (e) => {
    e.preventDefault()

    registerTwitterHandle(
      info.user,
      `https://twitter.com/${info.user}/status/${info.id}`
    )
  }

  if (wallet?.connected) {
    if (twitterHandle) {
      return <h2>Registered to: {twitterHandle}</h2>
    } else {
      return (
        <div>
          <Button onClick={(e) => handleTweetButton(e)}>Tweet</Button>
          <Button onClick={(e) => handleVerificationCheck(e)}>Verify</Button>
          {info?.id && (
            <div>
              <h2>Is this your Tweet?</h2>
              <Tweet tweetId={info.id} />
              <Button onClick={(e) => handleRegistration(e)}>Register</Button>
            </div>
          )}
        </div>
      )
    }
  } else {
    return 'not connected'
  }
}

export default TwitterVerification
