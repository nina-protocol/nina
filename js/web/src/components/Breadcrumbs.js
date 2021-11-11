import React, {useContext} from 'react'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { NavLink } from 'react-router-dom'
import ninaCommon from 'nina-common'

const { ReleaseContext } = ninaCommon.contexts

const ReleaseBreadcrumb = ({ match }) => {
  const {releaseState} = useContext(ReleaseContext)
  return (
    <span>{releaseState.metadata[match.params.releasePublicKey]}</span>
  )
};

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/releases', breadcrumb: 'Releases' },
  { path: '/releases/:releasePublicKey', breadcrumb: ReleaseBreadcrumb },
];

const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map(({
      match,
      breadcrumb
    }) => (
      <span key={match.url}>
        <NavLink to={match.url}>{breadcrumb}</NavLink>
      </span>
    ))}
  </div>
)

export default withBreadcrumbs(routes)(Breadcrumbs);