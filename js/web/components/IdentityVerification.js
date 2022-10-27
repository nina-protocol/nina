import { useEffect, useContext, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import axios from 'axios'
import Web3 from 'web3'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
import { useSnackbar } from 'notistack'
import IdentityVerificationModal from './IdentityVerificationModal'
import {
  verifyEthereum,
  verifyTwitter,
  verifySoundcloud,
  verifyInstagram,
} from '../utils/identityVerification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSoundcloud,
  faTwitter,
  faInstagram,
  faEthereum,
} from '@fortawesome/free-brands-svg-icons'

const IdentityVerification = ({ verifications, profilePublicKey }) => {
  const web3 = new Web3(process.env.ETH_CLUSTER_URL)
  const enqueueSnackbar = useSnackbar()

  const router = useRouter()
  const { publicKey, signTransaction } = useWallet()
  const { ninaClient } = useContext(Nina.Context)
  const { provider } = ninaClient

  const [open, setOpen] = useState(false)
  const [ethAddress, setEthAddress] = useState(undefined)
  const [soundcloudHandle, setSoundcloudHandle] = useState(undefined)
  const [soundcloudToken, setSoundcloudToken] = useState(undefined)
  const [twitterHandle, setTwitterHandle] = useState(undefined)
  const [twitterToken, setTwitterToken] = useState(undefined)
  const [instagramHandle, setInstagramHandle] = useState(undefined)
  const [instagramToken, setInstagramToken] = useState(undefined)
  const [instagramUserId, setInstagramUserId] = useState(undefined)
  const [action, setAction] = useState(undefined)
  const [activeType, setActiveType] = useState(undefined)
  const [activeValue, setActiveValue] = useState(undefined)

  const logos = {
    soundcloud: <FontAwesomeIcon icon={faSoundcloud} size="1x" />,
    twitter: <FontAwesomeIcon icon={faTwitter} size="1x" />,
    instagram: <FontAwesomeIcon icon={faInstagram} size="1x" />,
    ethereum: <FontAwesomeIcon icon={faEthereum} size="1x" />,
  }

  const accountVerifiedForType = (type) => {
    return verifications.find((verification) => verification.type === type)
  }

  const displayNameForValue = (value, type) => {
    if (type === 'ethereum') {
      return truncateAddress(value)
    }
    return value
  }

  const displayNameForType = (type) => {
    const verification = verifications.find(
      (verification) => verification.type === type
    )
    return (
      verification.displayName || displayNameForValue(verification.value, type)
    )
  }

  const valueForType = (type) => {
    return verifications.find((verification) => verification.type === type)
      .value
  }

  const buttonTextForType = (type) => {
    if (accountVerifiedForType(type)) {
      return displayNameForType(type)
    } else {
      return 'Connect'
    }
  }

  const buttonTypes = useMemo(() => {
    const buttonArray = []
    if (publicKey?.toBase58() === profilePublicKey) {
      buttonArray.push('soundcloud', 'twitter', 'instagram', 'ethereum')
    } else {
      verifications.forEach((verification) => {
        if (verification.type === 'soundcloud') {
          buttonArray.push('soundcloud')
        }
        if (verification.type === 'twitter') {
          buttonArray.push('twitter')
        }
        if (verification.type === 'instagram') {
          buttonArray.push('instagram')
        }
        if (verification.type === 'ethereum') {
          buttonArray.push('ethereum')
        }
      })
    }
    return buttonArray
  }, [publicKey, verifications])

  useEffect(() => {
    if (router.query.code) {
      const getHandle = async () => {
        try {
          const codeSource = localStorage.getItem('codeSource')
          setActiveType(codeSource)
          if (codeSource === 'soundcloud') {
            const response = await axios.post(
              `${process.env.NINA_IDENTITY_ENDPOINT}/sc/user`,
              {
                code: router.query.code,
              }
            )
            if (response.data) {
              setSoundcloudHandle(response.data.username)
              console.log('reponse.data.username', response.data.username)
              setActiveValue(response.data.username)
              setSoundcloudToken(response.data.token.access_token)
            }
          } else if (codeSource === 'instagram') {
            const response = await axios.post(
              `${process.env.NINA_IDENTITY_ENDPOINT}/ig/user`,
              {
                code: router.query.code,
              }
            )
            if (response.data) {
              setInstagramHandle(response.data.username)
              setActiveValue(response.data.username)
              setInstagramToken(response.data.token)
              setInstagramUserId(response.data.userId)
            }
          } else if (codeSource === 'twitter') {
            const response = await axios.post(
              `${process.env.NINA_IDENTITY_ENDPOINT}/tw/user`,
              {
                code: router.query.code,
              }
            )
            if (response.data) {
              setTwitterHandle(response.data.username)
              setActiveValue(response.data.username)
              setTwitterToken(response.data.token)
            }
          } else if (codeSource === 'ethereum') {
            setActiveValue(ethAddress)
          }
        } catch (error) {
          console.warn(error)
          setActiveValue(undefined)
        }
      }

      getHandle()
      setOpen(true)
    }
  }, [router.query.code])

  const handleIdentityButtonAction = async (type) => {
    if (accountVerifiedForType(type)) {
      switch (type) {
        case 'twitter':
          window.open(`https://twitter.com/${valueForType(type)}`, '_blank')
          break
        case 'instagram':
          window.open(`https://instagram.com/${valueForType(type)}`, '_blank')
          break
        case 'soundcloud':
          window.open(`https://soundcloud.com/${valueForType(type)}`, '_blank')
          break
        case 'ethereum':
          window.open(
            `https://etherscan.io/address/${valueForType(type)}`,
            '_blank'
          )
          break
      }
    } else {
      await handleConnectAccount(type)
    }
  }

  const handleVerify = async () => {
    switch (localStorage.getItem('codeSource')) {
      case 'soundcloud':
        await verifySoundcloud(
          provider,
          soundcloudHandle,
          publicKey,
          signTransaction
        )
        break
      case 'twitter':
        await verifyTwitter(provider, twitterHandle, publicKey, signTransaction)
        break
      case 'instagram':
        await verifyInstagram(
          provider,
          instagramHandle,
          publicKey,
          signTransaction
        )
        break
      case 'ethereum':
        await verifyEthAddress(provider, ethAddress, publicKey, signTransaction)
        break
    }
  }

  const handleConnectAccount = async (type) => {
    localStorage.setItem('codeSource', type)

    switch (type) {
      case 'soundcloud':
        router.push(
          `https://soundcloud.com/connect?client_id=${process.env.SC_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&response_type=code&scope=non-expiring`
        )
        break
      case 'instagram':
        router.push(
          `https://api.instagram.com/oauth/authorize?client_id=${process.env.IG_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`
        )
        break
      case 'twitter':
        router.push(
          `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_AUTH_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
        )
        break

      case 'ethereum':
        var accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setEthAddress(accounts[0])
        break
    }
  }
  return (
    <>
      <CtaWrapper>
        {buttonTypes &&
          buttonTypes.map((buttonType, index) => {
            return (
              <Button
                onClick={() => handleIdentityButtonAction(buttonType)}
                key={index}
              >
                <Box display="flex" alignItems="center">
                  {logos[buttonType]}{' '}
                  <Typography ml={1} variant="body2">
                    {buttonTextForType(buttonType)}
                  </Typography>
                </Box>
              </Button>
            )
          })}
      </CtaWrapper>
      {activeValue && (
        <Box>
          <IdentityVerificationModal
            action={handleVerify}
            type={localStorage.getItem('codeSource')}
            value={activeValue}
            open={open}
            setOpen={setOpen}
          />
        </Box>
      )}
    </>
  )
}

const CtaWrapper = styled(Box)(() => ({
  '& button': {
    color: 'black',
    border: '1px solid black',
    marginRight: '15px',
    '& svg': {
      fontSize: '16px',
    },
  },
}))

export default IdentityVerification
