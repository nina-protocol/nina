import React, { useEffect, useContext, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import axios from 'axios'
import CloseIcon from '@mui/icons-material/Close'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateManager'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import { useSnackbar } from 'notistack'
import IdentityVerificationModal from './IdentityVerificationModal'
import IdentityDisconnectModal from './IdentityDisconnectModal'
import {
  verifyEthereum,
  verifyTwitter,
  verifySoundcloud,
  verifyInstagram,
  deleteTwitterVerification
} from '../utils/identityVerification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSoundcloud,
  faTwitter,
  faInstagram,
  faEthereum,
} from '@fortawesome/free-brands-svg-icons'

const IdentityVerification = ({
  verifications,
  profilePubkey,
  inOnboardingFlow,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { wallet } = useContext(Wallet.Context)
  const { publicKey, signTransaction, sendTransaction } = wallet
  const { ninaClient, getVerificationsForUser } = useContext(Nina.Context)
  const { provider } = ninaClient

  const [open, setOpen] = useState(false)
  const [openDisconnectModal, setOpenDisconnectModal] = useState(false)
  const [disconnecting, setDisconencting] = useState(false)
  const [ethAddress, setEthAddress] = useState(undefined)
  const [soundcloudHandle, setSoundcloudHandle] = useState(undefined)
  const [soundcloudToken, setSoundcloudToken] = useState(undefined)
  const [twitterHandle, setTwitterHandle] = useState(undefined)
  const [twitterToken, setTwitterToken] = useState(undefined)
  const [instagramHandle, setInstagramHandle] = useState(undefined)
  const [instagramToken, setInstagramToken] = useState(undefined)
  const [instagramUserId, setInstagramUserId] = useState(undefined)
  const [activeValue, setActiveValue] = useState(undefined)

  const logos = {
    soundcloud: (
      <FontAwesomeIcon
        icon={faSoundcloud}
        size="1x"
        style={{ height: '16px' }}
      />
    ),
    twitter: (
      <FontAwesomeIcon icon={faTwitter} size="1x" style={{ height: '16px' }} />
    ),
    instagram: (
      <FontAwesomeIcon
        icon={faInstagram}
        size="1x"
        style={{ height: '16px' }}
      />
    ),
    ethereum: (
      <FontAwesomeIcon icon={faEthereum} size="1x" style={{ height: '16px' }} />
    ),
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
    if (publicKey?.toBase58() === profilePubkey) {
      buttonArray.push('twitter', 'soundcloud')
      if (accountVerifiedForType('ethereum')) {
        buttonArray.push('ethereum')
      }
    } else {
      verifications.forEach((verification) => {
        if (verification.type === 'twitter') {
          buttonArray.push('twitter')
        }
        if (verification.type === 'soundcloud') {
          buttonArray.push('soundcloud')
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
    const codeSource = localStorage.getItem('codeSource')
    const getHandle = async () => {
      try {
        if (codeSource === 'soundcloud') {
          const response = await axios.post(
            `${process.env.NINA_IDENTITY_ENDPOINT}/sc/user`,
            {
              code: router.query.code,
            }
          )
          if (response.data) {
            setSoundcloudHandle(response.data.username)
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
        }
      } catch (error) {
        console.warn(error)
        setActiveValue(undefined)
      }
    }

    if (router.query.code) {
      getHandle()
    } else if (ethAddress) {
      setActiveValue(ethAddress)
    }
    setOpen(true)
  }, [router.query.code, ethAddress])

  const handleIdentityButtonAction = async (type) => {
    if (accountVerifiedForType(type)) {
      const value = valueForType(type)
      console.log('value :>> ', value);
      const params = {
        type,
        value,
      }
      if (publicKey) {
        params.wallet = publicKey.toBase58()
      }

      logEvent('connection_action', 'engagement', params)

      switch (type) {
        case 'twitter':
          window.open(`https://twitter.com/${value}`, '_blank')
          break
        case 'instagram':
          window.open(`https://instagram.com/${value}`, '_blank')
          break
        case 'soundcloud':
          window.open(`https://soundcloud.com/${value}`, '_blank')
          break
        case 'ethereum':
          window.open(`https://etherscan.io/address/${value}`, '_blank')
          break
      }
    } else {
      await handleConnectAccount(type)
    }
  }

  const handleVerify = async () => {
    let success = false
    switch (localStorage.getItem('codeSource')) {
      case 'soundcloud':
        console.log('signTransation :>> ', signTransation);
        success = await verifySoundcloud(
          provider,
          soundcloudHandle,
          publicKey,
          signTransaction,
          soundcloudToken
        )
        break
      case 'twitter':
        success = await verifyTwitter(
          provider,
          twitterHandle,
          twitterToken,
          publicKey,
          signTransaction
        )
        break
      case 'instagram':
        success = await verifyInstagram(
          provider,
          instagramUserId,
          instagramHandle,
          publicKey,
          signTransaction,
          instagramToken
        )
        break
      case 'ethereum':
        success = await verifyEthereum(
          provider,
          ethAddress,
          publicKey,
          signTransaction
        )
        break
    }

    if (success) {
      await getVerificationsForUser(profilePubkey)
      enqueueSnackbar('Account verified.', {
        variant: 'success',
      })
    }
  }

  const handleConnectAccount = async (type) => {
    if (inOnboardingFlow) {
      localStorage.setItem('inOnboardingFlow', 'true')
    } else {
      localStorage.removeItem('inOnboardFlow')
    }
    localStorage.setItem('codeSource', type)

    switch (type) {
      case 'soundcloud':
        router.push(
          `https://soundcloud.com/connect?client_id=${process.env.SC_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&response_type=code&scope=non-expiring`
        )
        break
      case 'instagram':
        router.push(
          `https://api.instagram.com/oauth/authorize?client_id=${process.env.IG_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}/&scope=user_profile,user_media&response_type=code`
        )
        break
      case 'twitter':
        router.push(
          `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_AUTH_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
        )
        break

      case 'ethereum':
        setEthAddress(undefined)
        var accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setEthAddress(accounts[0])
        break
    }
  }

  const handleDisconnectFlow = async (e, type) => {
    e.stopPropagation()
    setDisconencting(true)
    console.log('type :>> ', type);
    localStorage.setItem('codeSource', type)
    setOpenDisconnectModal(true)
    setActiveValue(valueForType(type))
  }



  const handleDisconnectAccount = async () => {
    let success = false
    switch (localStorage.getItem('codeSource')) {
      case 'twitter':
        success = await deleteTwitterVerification(
          provider,
          twitterHandle,
          publicKey,
          signTransaction,
          sendTransaction
        )
      case 'ethereum':
        success = await deleteEthereumVerification(
          provider,
          ethAddress,
          publicKey,
          signTransaction,
          sendTransaction
          )
        return success
        default:
          break
        }

      if (success) {
        await getVerificationsForUser(profilePubkey)
        enqueueSnackbar('Account verified.', {
          variant: 'success',
        })
      }
  }

  return (
    <>
      <CtaWrapper inOnboardingFlow={inOnboardingFlow}>
        {buttonTypes &&
          buttonTypes
            .slice(0, inOnboardingFlow ? 2 : buttonTypes.length)
            .map((buttonType, index) => {
              return (
                <StyledCta
                  onClick={() => handleIdentityButtonAction(buttonType)}
                  key={index}
                  inOnboardingFlow={inOnboardingFlow}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    padding={inOnboardingFlow ? '8px' : ''}
                  >
                    {logos[buttonType]}{' '}
                    <Typography ml={1} variant="body2">
                      {buttonTextForType(buttonType)}
                    </Typography>

                    {accountVerifiedForType(buttonType) && (
                      <CloseIcon  sx={{ml: 1}} onClick={e => handleDisconnectFlow(e, buttonType)}/>
                    )}
                  </Box>
                </StyledCta>
              )
            })}
      </CtaWrapper>
      {activeValue && !disconnecting && (
        <Box>
          <IdentityVerificationModal
            action={handleVerify}
            type={localStorage.getItem('codeSource')}
            value={activeValue}
            open={open}
            setOpen={setOpen}
            disconnecting={disconnecting}
          />
        </Box>
      )}
      {openDisconnectModal && disconnecting && (
        <IdentityDisconnectModal 
          setOpen={setOpenDisconnectModal}
          open={openDisconnectModal}
          value={activeValue}
          type={localStorage.getItem('codeSource')}
          action={handleDisconnectAccount}
          disconneting={disconnecting}
        />
      ) }
    </>
  )
}

const CtaWrapper = styled(Box)(({ theme, inOnboardingFlow }) => ({
  '& button': {
    color: 'black',
    border: '1px solid black',
    borderRadius: '0px',
    margin: inOnboardingFlow ? '10px 0 0 0' : '0 8px',
    [theme.breakpoints.down('md')]: {
      padding: '10px 10px 10px 0px',
      '& p': {
        display: 'none',
      },
    },
    '& svg': {
      fontSize: '16px',
      [theme.breakpoints.down('md')]: {
        fontSize: '20px',
      },
    },
  },
}))

const StyledCta = styled(Button)(({ inOnboardingFlow }) => ({
  width: inOnboardingFlow ? '100%' : '',
  // margin: inOnboardingFlow ? '10px 0px 0px 0px' : '0px',
  // padding: inOnboardingFlow ? '10px' : '10px 10px 10px 0px',
}))

export default IdentityVerification
