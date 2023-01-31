import { useEffect, useState } from 'react'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from './sdkInit'

const PendingReleaseManager = () => {
  const [pendingReleases, setPendingReleases] = useState({})
  useEffect(() => {
    initSdkIfNeeded()

    let releaseCreationPending = localStorage.getItem(
      'release_creation_pending'
    )
    
    if (releaseCreationPending) {
      releaseCreationPending = JSON.parse(releaseCreationPending)
      setPendingReleases(releaseCreationPending)
      Object.keys(releaseCreationPending).forEach(releasePublicKey => {
        const pendingRelease = releaseCreationPending[releasePublicKey]
        trackPendingRelease({
          releasePublicKey,
          artist: pendingRelease.artist,
          title: pendingRelease.title,
        })
      })
    }
  }, [])

  const trackPendingRelease = async ({
    releasePublicKey,
    artist,
    title,
  }) => {
    const releasePublicKeyString = releasePublicKey.toBase58()
    await promiseRetry(
      async (retry) => {
        let { ninaReleaseExists, solanaReleaseExists } = await lookupPendingRelease({
          releasePublicKey,
          artist,
          title,
        })
  
        if (!solanaReleaseExists) {
          const error = new Error('release_does_not_exist_on_solana')
          error.releasePublicKey = releasePublicKeyString
  
          retry(error)
          return
        }

        if (!ninaReleaseExists) {
          const error = new Error('release_does_not_exist_on_nina')
          error.releasePublicKey = releasePublicKeyString
          retry(error)
          return
        }

        let releaseCreationPending = localStorage.getItem(
          'release_creation_pending'
        )
        if (releaseCreationPending) {
          releaseCreationPending = JSON.parse(releaseCreationPending)
          delete releaseCreationPending[releasePublicKeyString]
          localStorage.setItem(
            'release_creation_pending',
            JSON.stringify(releaseCreationPending)
          )
        }

        return releasePublicKeyString
      },
      {
        retries: 60,
        minTimeout: 500,
        maxTimeout: 1000,
      }
    )
  
  }

  const lookupPendingRelease = async ({
    releasePublicKey,
    artist,
    title,
  }) => {
    const solanaAccount = await NinaSdk.client.program.account.release.fetch(releasePublicKey)
    const releasePublicKeyString = releasePublicKey.toBase58()
    const ninaRelease = await NinaSdk.Release.fetch(releasePublicKeyString)
    let releaseCreationPending = localStorage.getItem(
      'release_creation_pending'
    )
    if (!releaseCreationPending) {
      releaseCreationPending = {}
    } else {
      releaseCreationPending = JSON.parse(releaseCreationPending)
    }
    
    let pendingRelease = releaseCreationPending[releasePublicKeyString]
    if (pendingRelease) {
      pendingRelease.ninaReleaseExists = ninaRelease.release ? true : false
      pendingRelease.solanaReleaseExists = solanaAccount ? true : false
    } else {
      pendingRelease = {
        artist,
        title,
        ninaReleaseExists: ninaRelease.release ? true : false,
        solanaReleaseExists: solanaAccount ? true : false,
        date: new Date()
      }
    }

    const updatedReleaseCreationPending = JSON.stringify({
      ...releaseCreationPending,
      [releasePublicKeyString]: pendingRelease,
    })

    localStorage.setItem(
      'release_creation_pending',
      updatedReleaseCreationPending
    )
    
    return {
      ninaReleaseExists,
      solanaReleaseExists,
    }
  }
}
  