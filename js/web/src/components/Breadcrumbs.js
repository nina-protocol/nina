import React, { useContext, useState, useEffect } from 'react'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { NavLink } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography, Box } from '@mui/material'

const { ReleaseContext } = ninaCommon.contexts

const ReleaseBreadcrumb = ({ match }) => {
  const { releaseState } = useContext(ReleaseContext)
  const release = releaseState.metadata[match.params.releasePubkey]
  if (release) {
    return (
      <StyledReleaseBreadcrumb>
        <Typography display="inline" variant="subtitle1">
          {release.properties.artist},
        </Typography>{' '}
        <Typography
          display="inline"
          variant="subtitle1"
          sx={{ fontStyle: 'italic' }}
        >
          {release.properties.title}
        </Typography>
      </StyledReleaseBreadcrumb>
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

  const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
    useState()
  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser(wallet.publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleasesCount(filterReleasesUserCollection().length || 0)
    }
  }, [releaseState])

  return (
    <Typography variant="subtitle1">
      Your Collection ({userCollectionReleasesCount || 0})
    </Typography>
  )
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
      getReleasesPublishedByUser(wallet.publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(filterReleasesPublishedByUser().length || 0)
    }
  }, [releaseState])

  return (
    <Typography variant="subtitle1">
      Your Releases ({userPublishedReleasesCount})
    </Typography>
  )
}

const routes = [
  {
    path: '/',
    breadcrumb: () => <Typography variant="subtitle1">Home</Typography>,
  },
  {
    path: '/faq',
    breadcrumb: () => <Typography variant="subtitle1">Faq</Typography>,
  },
  {
    path: '/allReleases',
    breadcrumb: () => <Typography variant="subtitle1">All Releases</Typography>,
  },
  { path: '/releases', breadcrumb: YourReleasesBreadcrumb },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  {
    path: '/releases/:releasePubkey/market',
    breadcrumb: () => <Typography variant="subtitle1">Market</Typography>,
  },
  { path: '/collection', breadcrumb: YourCollectionBreadcrumb },
  { path: '/collection/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  {
    path: '/collection/:releasePubkey/market',
    breadcrumb: () => <Typography variant="subtitle1">Home</Typography>,
  },
  {
    path: '/upload',
    breadcrumb: () => <Typography variant="subtitle1">Upload</Typography>,
  },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  {
    path: '/:releasePubkey/related',
    breadcrumb: () => <Typography variant="subtitle1">Related</Typography>,
  },
  { path: '/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
]

const Breadcrumbs = ({ breadcrumbs }) => (
  <BreadcrumbsContainer>
    {breadcrumbs.map(({ match, breadcrumb }) => (
      <span key={match.url} className="breadcrumb">
        <Typography variant="subtitle1" sx={{ padding: '0 10px' }}>
          {`/`}
        </Typography>
        <NavLink to={match.url}>{breadcrumb}</NavLink>
      </span>
    ))}
  </BreadcrumbsContainer>
)

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  fontSize: '10px',
  display: 'flex',
  position: 'absolute',
  top: '12px',
  '& .breadcrumb': {
    display: 'flex',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const StyledReleaseBreadcrumb = styled('div')(() => ({
  display: 'block',
  paddingRight: '1px',
  maxWidth: '200px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: '1',
}))

export default withBreadcrumbs(routes)(Breadcrumbs)
