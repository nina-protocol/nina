import React, {useContext, useEffect, useMemo} from 'react'
import nina from '@nina-protocol/nina-sdk'
const { HubContext, NinaContext, ReleaseContext } = nina.contexts

const Hub = ({ hubPubkey }) => {
  const { getHub, hubState, hubContentState, hubCollaboratorsState, filterHubContentForHub, filterHubCollaboratorsForHub  } = useContext(HubContext)
  const { postState } = useContext(NinaContext)
  const { releaseState } = useContext(ReleaseContext)

  const hub = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  const releases = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  useEffect(() => {
    getHub(hubPubkey)
  }, [])

  const hubCollaborators = useMemo(() => filterHubCollaboratorsForHub(hubPubkey), [hubCollaboratorsState, hubPubkey])
  const [hubReleases, hubPosts, hubReleasePosts] = useMemo(() => {
    const [hubReleasesArray, hubPostsArray] = filterHubContentForHub(hubPubkey)
    let hubReleasePosts = []
    let hubPosts = []
    let hubReleases = []
    hubPostsArray.forEach((hubPost, i) => {
      if (hubPost.referenceHubContent) {
        const hubRelease = hubReleasesArray.find(hr => hr.release === hubPost.referenceHubContent)
        const index = hubReleasesArray.indexOf(hubRelease)
        if (index > -1) {
          hubReleasePosts.push({
            hubRelease: hubReleasesArray.splice(index, 1)[0],
            hubPost: hubPostsArray.splice(i, 1)[0]
          })
        }
      }
      hubPosts.push(hubPost)
    })
    hubReleases = [...hubReleasesArray]
    return [hubReleases, hubPosts, hubReleasePosts]
  },[hubContentState, hubPubkey])
  const publishedCount = useMemo(() => hubReleases.filter(release => release.publishedThroughHub).length, [hubReleases])

  return (
    <>
      <span>{hubCollaborators.length} Collaborators</span>
      <span>{publishedCount} Published Releases</span>
      <span>{hubReleases.length - publishedCount} Reposted Releases</span>
      <span>{hubPosts.length} Posts</span>
      <span>{hubReleasePosts.length} Release Posts</span>
    </>
  )
}

export default Hub