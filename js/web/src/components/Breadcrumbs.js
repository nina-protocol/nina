import React, { useContext, useState, useEffect } from 'react'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { NavLink } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'

const { ReleaseContext } = ninaCommon.contexts

const ReleaseBreadcrumb = ({ match }) => {
  const { releaseState } = useContext(ReleaseContext)
  const release = releaseState.metadata[match.params.releasePubkey]
  if (release) {
    return (
      <>
        <span>{release.properties.artist},</span>{' '}
        <Title>{release.properties.title}</Title>
      </>
    )
  }
  return null
}

const YourCollectionBreadcrumb = () => {
  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesUserCollection,
  } = useContext(ReleaseContext)
  const wallet = useWallet()

  const [userCollectionReleasesCount, setUserCollectionReleasesCount] = useState()
  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser()
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleasesCount(filterReleasesUserCollection().length || 0)
    }
  }, [releaseState])

  return <span>Your Collection ({userCollectionReleasesCount})</span>
}

const YourReleasesBreadcrumb = () => {
  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
  } = useContext(ReleaseContext)
  const wallet = useWallet()

  const [userPublishedReleasesCount, setUserPublishedReleasesCount] = useState()
  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser()
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(filterReleasesPublishedByUser().length || 0)
    }
  }, [releaseState])

  return <span>Your Releases ({userPublishedReleasesCount})</span>
}

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/releases', breadcrumb: YourReleasesBreadcrumb },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  { path: '/releases/:releasePubkey/market', breadcrumb: 'Market' },
  { path: '/collection', breadcrumb: YourCollectionBreadcrumb },
  { path: '/collection/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  { path: '/collection/:releasePubkey/market', breadcrumb: 'Market' },
  { path: '/upload', breadcrumb: 'Upload' },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
]

const Breadcrumbs = ({ breadcrumbs }) => (
  <BreadcrumbsContainer>
    {breadcrumbs.map(({ match, breadcrumb }) => (
      <span key={match.url}>
        <BreadcrumbSeperator>{`/`}</BreadcrumbSeperator>
        <NavLink to={match.url}>{breadcrumb}</NavLink>
      </span>
    ))}
  </BreadcrumbsContainer>
)

const BreadcrumbsContainer = styled('span')(() => ({
  paddingLeft: '30px',
  fontSize: '10px'
}))
const Title = styled('span')(() => ({
  fontStyle: 'italic',
}))

const BreadcrumbSeperator = styled('span')(() => ({
  padding: '0 10px',
}))

export default withBreadcrumbs(routes)(Breadcrumbs)
