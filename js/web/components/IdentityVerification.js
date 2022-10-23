import { useEffect, useContext, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import axios from 'axios';
import Web3 from "web3";
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'


const IdentityVerification = ({ verifications, profilePublicKey }) => {
  const web3 = new Web3(process.env.ETH_CLUSTER_URL);

  const router = useRouter()
  const { publicKey, signTransaction } = useWallet();
  const { ninaClient } = useContext(Nina.Context)
  const { provider } = ninaClient

  const [ethAddress, setEthAddress] = useState(undefined);
  const [soundcloudHandle, setSoundcloudHandle] = useState(undefined);
  const [soundcloudToken, setSoundcloudToken] = useState(undefined);
  const [twitterHandle, setTwitterHandle] = useState(undefined);
  const [twitterToken, setTwitterToken] = useState(undefined);
  const [instagramHandle, setInstagramHandle] = useState(undefined);
  const [instagramToken, setInstagramToken] = useState(undefined);
  const [instagramUserId, setInstagramUserId] = useState(undefined);

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
    const verification = verifications.find((verification) => verification.type === type)
    return verification.displayName || displayNameForValue(verification.value, type)
  }
  
  const valueForType = (type) => {
    return verifications.find((verification) => verification.type === type).value
  }

  const buttonTextForType = (type) => {
    if (accountVerifiedForType(type)) {
      return displayNameForType(type)
    } else {
      return `Verify ${type}`
    }
  }

  const buttonTypes = useMemo(() => {
    const buttonArray = [];
    if (publicKey.toBase58() === profilePublicKey) {
      buttonArray.push(
        'soundcloud',
        'twitter',
        'instagram',
        'ethereum'
      );
    } else {
      verifications.forEach((verification) => {
        if (verification.type === 'soundcloud') {
          buttonArray.push('soundcloud');
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
    return buttonArray;
  }, [publicKey, verifications])

  useEffect(() => {
    if (router.query.code) {
      const getHandle = async () => {
        try {
          const codeSource = localStorage.getItem('codeSource');
        
          if (codeSource === 'soundcloud') {
            const response = await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/sc/user`, {
              code: router.query.code,
            })
            if (response.data) {
              setSoundcloudHandle(response.data.username)
              setSoundcloudToken(response.data.token.access_token)
            }    
          } else if (codeSource === 'instagram') {
            const response = await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/ig/user`, {
              code: router.query.code,
            })
            if (response.data) {
              setInstagramHandle(response.data.username)
              setInstagramToken(response.data.token)
              setInstagramUserId(response.data.userId)
            }    
          } else if (codeSource === 'twitter') {
            const response = await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/tw/user`, {
              code: router.query.code,
            })
            if (response.data) {
              setTwitterHandle(response.data.username)
              setTwitterToken(response.data.token)
            }    
          }
        } catch (error) {
          console.warn(error)
        }
      }

      getHandle()
    }
  }, [router.query.code])


  const handleIdentityButtonAction = async (type) => {
    if (accountVerifiedForType(type)) {
      switch (type) {
        case 'twitter':
          window.open(`https://twitter.com/${valueForType(type)}`, '_blank');
          break;
        case 'instagram':
          window.open(`https://instagram.com/${valueForType(type)}`, '_blank');
          break;
        case 'soundcloud':
          window.open(`https://soundcloud.com/${valueForType(type)}`, '_blank');
          break;
        case 'ethereum':
          window.open(`https://etherscan.io/address/${valueForType(type)}`, '_blank');
          break;
      }
    } else {
      await handleConnectAccount(type)
    }
  }

  const handleConnectAccount = async (type) => {
    localStorage.setItem('codeSource', type);

    switch (type) {
      case 'soundcloud':
        router.push(`https://soundcloud.com/connect?client_id=${process.env.SC_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&response_type=code&scope=non-expiring`)
        break;
      case 'instagram':
        router.push(`https://api.instagram.com/oauth/authorize?client_id=${process.env.IG_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`)
        break;
      case 'twitter':
        router.push(`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_AUTH_CLIENT_ID}&redirect_uri=${process.env.IDENTITY_REDIRECT_URI}&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`)
        break;

      case 'ethereum':
        var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setEthAddress(accounts[0]);
        break;
    }
  }

  const handleVerifyEthAddress = async () => {
    try {
      setResponse(undefined);
      // Sign An Ethereum Message Containing the Solana Public Key
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [ethAddress, web3.utils.sha3(publicKey.toBase58())]
      });
      console.log(signature);
  
      // Create Name Account Registry
      const ix = await createNameRegistry(provider.connection, ethAddress, 96, publicKey, publicKey, LAMPORTS_FOR_NAME_ACCOUNT, NINA_ID, NINA_ID_ETH_TLD)
      
      // Create Reverse Lookup Account Registry
      const [createIx, reverseRegistryIx] = await ReverseEthAddressRegistryState.createLookupInstructions(ethAddress, publicKey)
  
      // Build and Sign Transaction
      const tx = new Transaction({
        recentBlockhash: (await provider.connection.getLatestBlockhash()).blockhash,
        feePayer: publicKey
      });
      tx.add(ix, createIx, reverseRegistryIx)
      await signTransaction(tx)
  
      // Send Transaction To Server To Verify Signatures
      const response = await axios.post(`${process.env.API_URL}/eth`, {
        ethAddress,
        ethSignature: signature,
        tx: tx.serialize({verifySignatures: false}).toString('base64'),
        solPublicKey: publicKey.toBase58()
      })
      setResponse(`https://explorer.solana.com/tx/${response.data.signature}`);
    } catch (error) {
      console.log('error: ', error)
      setResponse(error.response.data);
    }
  }

  const handleVerifySoundcloud = async () => {
    try {
      setResponse(undefined);  
      // Create Name Account Registry
      const ix = await createNameRegistry(provider.connection, soundcloudHandle, 96, publicKey, publicKey, LAMPORTS_FOR_NAME_ACCOUNT, NINA_ID, NINA_ID_SC_TLD)
      
      // Create Reverse Lookup Account Registry
      const [createIx, reverseRegistryIx] = await ReverseSoundcloudRegistryState.createLookupInstructions(soundcloudHandle, publicKey)
  
      // Build and Sign Transaction
      const tx = new Transaction({
        recentBlockhash: (await provider.connection.getLatestBlockhash()).blockhash,
        feePayer: publicKey
      });
      tx.add(ix, createIx, reverseRegistryIx)
      await signTransaction(tx)
      console.log('tx: ', tx)
      // Send Transaction To Server To Verify Signatures
      const response = await axios.post(`${process.env.API_URL}/sc/register`, {
        handle: soundcloudHandle,
        token: soundcloudToken,
        tx: tx.serialize({verifySignatures: false}).toString('base64'),
        publicKey: publicKey.toBase58()
      })
      setResponse(`https://explorer.solana.com/tx/${response.data.signature}`);
    } catch (error) {
      console.log('error: ', error)
      // setResponse(error?.response?.data);
    }
  }

  const handleVerifyTwitter = async () => {
    try {
      setResponse(undefined);  
      // Create Name Account Registry
      const ix = await createNameRegistry(provider.connection, twitterHandle, 96, publicKey, publicKey, LAMPORTS_FOR_NAME_ACCOUNT, NINA_ID, NINA_ID_TW_TLD)
      console.log('ix: ', ix)
      console.log('twitterHandle: ', twitterHandle)
      // Create Reverse Lookup Account Registry
      const [createIx, reverseRegistryIx] = await ReverseTwitterRegistryState.createLookupInstructions(twitterHandle, publicKey)
      console.log('createIx: ', createIx)
      console.log('reverseRegistryIx: ', reverseRegistryIx)
      // Build and Sign Transaction
      const tx = new Transaction({
        recentBlockhash: (await provider.connection.getLatestBlockhash()).blockhash,
        feePayer: publicKey
      });
      tx.add(ix, createIx, reverseRegistryIx)
      await signTransaction(tx)
  
      // Send Transaction To Server To Verify Signatures
      const response = await axios.post(`${process.env.API_URL}/tw/register`, {
        handle: twitterHandle,
        token: twitterToken,
        tx: tx.serialize({verifySignatures: false}).toString('base64'),
        publicKey: publicKey.toBase58()
      })
      setResponse(`https://explorer.solana.com/tx/${response.data.signature}`);
    } catch (error) {
      console.log('error: ', error)
      // setResponse(error.response.data);
    }
  }

  const handleVerifyInstagram = async () => {
    try {
      setResponse(undefined);
      // Create Name Account Registry
      const ix = await createNameRegistry(provider.connection, instagramHandle, 96, publicKey, publicKey, LAMPORTS_FOR_NAME_ACCOUNT, NINA_ID, NINA_ID_IG_TLD)

      // Create Reverse Lookup Account Registry
      const [createIx, reverseRegistryIx] = await ReverseInstagramRegistryState.createLookupInstructions(instagramHandle, publicKey)
      
      // Build and Sign Transaction
      const tx = new Transaction({
        recentBlockhash: (await provider.connection.getLatestBlockhash()).blockhash,
        feePayer: publicKey
      });
      tx.add(ix, createIx, reverseRegistryIx)
      await signTransaction(tx)

      // Send Transaction To Server To Verify Signatures
      const response = await axios.post(`${process.env.API_URL}/ig/register`, {
        handle: instagramHandle,
        userId: instagramUserId,
        tx: tx.serialize({verifySignatures: false}).toString('base64'),
        publicKey: publicKey.toBase58()
      })
      setResponse(`https://explorer.solana.com/tx/${response.data.signature}`);
    } catch (error) {
      console.log('error: ', error)
      // setResponse(error.response.data);
    }
  }
  return (
    <Box>
      {buttonTypes && buttonTypes.map(buttonType => (<Button onClick={() => handleIdentityButtonAction(buttonType)}>{buttonTextForType(buttonType)}</Button>))}
    </Box>
  )
}

export default IdentityVerification;