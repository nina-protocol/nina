import { useContext, useEffect, useMemo, useState } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { Toolbar } from '@mui/material'
import Grid from '@mui/material'
import dynamic from 'next/dynamic'
const HubHeader = dynamic(() => import('./HubHeader'))
const HubRelease = dynamic(() => import('./HubRelease'))
const HubComponent = ({ hubPubkey }) => {
  const { getHub, hubState, filterHubContentForHub, hubContentState } =
    useContext(Hub.Context)
  const { releaseState } = useContext(Release.Context)
  console.log('release state', releaseState)
  const [hubReleases, setHubReleases] = useState([])
  const [hubPosts, setHubPosts] = useState([])
  const [releaseData, setReleaseData] = useState([])
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  console.log('hubData', hubData)

  useEffect(() => {
    getHub(hubPubkey)
    setHubReleases([])
    setHubPosts([])
  }, [hubPubkey])

  useEffect(() => {
    const [releases, posts] = filterHubContentForHub(hubPubkey)
    setHubReleases(releases)
    setHubPosts(posts)
  }, [hubContentState])

  useEffect(() => {
    const data = hubReleases.map((hubRelease) => {
      const releaseMetadata = releaseState.metadata[hubRelease.release]
      return releaseMetadata
    })
    console.log('data', data)
    setReleaseData(data)
  }, [releaseState, hubReleases])

  console.log('releases', hubReleases)
  console.log('posts', hubPosts)
  console.log('releaseData ', releaseData)

  return (
    <div>
      {hubData && (
        <HubHeader
          hubImage={hubData?.json?.image || ''}
          hubName={hubData?.json?.displayName || ''}
          hubDescription={hubData?.json?.hubDescription || ''}
          hubUrl={hubData?.json?.externalUrl || ''}
          hubDate={hubData.createdAt}
        />
      )}
      {releaseData.map((release) => (
        <div key={release.name}>
          <HubRelease
            onPlay={() => console.log('play')}
            onQueue={() => console.log('queue')}
            artistName={release.properties.name}
            trackName={release.properties.title}
          />
        </div>
      ))}
    </div>
  )
}

export default HubComponent
