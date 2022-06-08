import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import nina from "@nina-protocol/nina-sdk";
import { useWallet } from '@solana/wallet-adapter-react'

const { ReleaseContext } = nina.contexts

const YourCollectionBreadcrumb = () => {
  const { releaseState, filterReleasesUserCollection } =
    useContext(ReleaseContext)
  const wallet = useWallet()

  const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
    useState()

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleasesCount(filterReleasesUserCollection().length || 0)
    } else {
      setUserCollectionReleasesCount(0)
    }
  }, [releaseState, wallet])

  return `Your Collection (${userCollectionReleasesCount || 0})`
}

const YourReleasesBreadcrumb = () => {
  const { releaseState, filterReleasesPublishedByUser } =
    useContext(ReleaseContext)
  const wallet = useWallet()

  const [userPublishedReleasesCount, setUserPublishedReleasesCount] =
    useState(0)

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(
        filterReleasesPublishedByUser()?.length || 0
      )
    }
  }, [releaseState])

  return ` Your Releases (${userPublishedReleasesCount})`
}

const releaseBreadcrumbFormatted = (metadata) => {
  return (
    <StyledReleaseBreadcrumb>
      <Typography display="inline" variant="subtitle1">
        {metadata?.properties.artist},
      </Typography>{' '}
      <Typography
        display="inline"
        variant="subtitle1"
        sx={{ fontStyle: 'italic' }}
      >
        {metadata?.properties.title}
      </Typography>
    </StyledReleaseBreadcrumb>
  )
}

const Breadcrumbs = () => {
  const router = useRouter()
  const [breadcrumbs, setBreadcrumbs] = useState(null)

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split('/')
      linkPath.shift()

      let pathArray

      switch (router.pathname) {
        case '/[releasePubkey]':
          pathArray = linkPath.map((path, i) => {
            const metadata =
              router.components[`${router.pathname}`].props.pageProps.metadata
            const slug = releaseBreadcrumbFormatted(metadata)
            return {
              breadcrumb: slug,
              href: '/' + linkPath.slice(0, i + 1).join('/'),
            }
          })
          break
        case '/[releasePubkey]/market':
        case '/[releasePubkey]/related':
          pathArray = linkPath.map((path, i) => {
            if (i === 0) {
              const metadata =
                router.components[`${router.pathname}`].props.pageProps.metadata
              const slug = releaseBreadcrumbFormatted(metadata)
              return {
                breadcrumb: slug,
                href: '/' + linkPath.slice(0, i + 1).join('/'),
              }
            }
            return {
              breadcrumb: path,
              href: '/' + linkPath.slice(0, i + 1).join('/'),
            }
          })
          break
        case '/collection':
          pathArray = linkPath.map((path, i) => {
            return {
              breadcrumb: <YourCollectionBreadcrumb />,
              href: '/' + linkPath.slice(0, i + 1).join('/'),
            }
          })
          break
        case '/releases/user':
          pathArray = [
            {
              breadcrumb: <YourReleasesBreadcrumb />,
              href: '/' + linkPath[0],
            },
          ]
          break
        default:
          pathArray = linkPath.map((path, i) => {
            return {
              breadcrumb: path,
              href: '/' + linkPath.slice(0, i + 1).join('/'),
            }
          })
          break
      }

      setBreadcrumbs(pathArray)
    }
  }, [router])

  if (!breadcrumbs) {
    return null
  }

  return (
    <BreadcrumbsContainer aria-label="breadcrumbs">
      <ol className="breadcrumbs__list">
        <li>
          <span>/</span>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => {
          return (
            <li key={breadcrumb.href}>
              <span>/</span>
              <Link href={breadcrumb.href}>
                <a>
                  <Typography variant="subtitle1">
                    {breadcrumb.breadcrumb}
                  </Typography>
                </a>
              </Link>
            </li>
          )
        })}
      </ol>
    </BreadcrumbsContainer>
  )
}

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  fontSize: '10px',
  display: 'flex',
  position: 'absolute',
  top: '12px',
  '& .breadcrumbs__list': {
    display: 'flex',
    margin: 0,
    paddingLeft: '20px',
    '& li': {
      textTransform: 'capitalize !important',
      display: 'flex',
      '& span': {
        padding: '0 10px',
      },
    },
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

export default Breadcrumbs
