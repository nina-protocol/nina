import React, {useContext} from 'react'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { NavLink } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'

const { ReleaseContext } = ninaCommon.contexts

const ReleaseBreadcrumb = ({ match }) => {
  const {releaseState} = useContext(ReleaseContext)
  const release = releaseState.metadata[match.params.releasePubkey]
  console.log(release)
  if (release) {
    return (
      <>
        <span>{release.properties.artist},</span> <Title>{release.properties.title}</Title>
      </>
    )
  }
  return null
};

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/releases', breadcrumb: 'Releases' },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  { path: '/releases/:releasePubkey/market', breadcrumb: 'Market' },
  { path: '/collection', breadcrumb: 'Collection' },
  { path: '/collection/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
  { path: '/collection/:releasePubkey/market', breadcrumb: 'Market' },
  { path: '/upload', breadcrumb: 'Upload' },
  { path: '/releases/:releasePubkey', breadcrumb: ReleaseBreadcrumb },
];

const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map(({
      match,
      breadcrumb
    }) => (
      <span key={match.url}>
        <>/  </>
        <NavLink to={match.url}>{breadcrumb}</NavLink>
        <>  </>
      </span>
    ))}
  </div>
)

const Title = styled('span')(() => ({
  fontStyle: 'italic',
}))

export default withBreadcrumbs(routes)(Breadcrumbs);