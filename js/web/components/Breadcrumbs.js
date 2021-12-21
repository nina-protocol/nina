import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {styled} from "@mui/material/styles";
import {Typography, Box} from "@mui/material";

const YourCollectionBreadcrumb = () => {
  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesUserCollection,
  } = useContext(ReleaseContext);
  const wallet = useWallet();

  const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
    useState();
  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser(wallet.publicKey);
    }
  }, [wallet?.connected]);

  useEffect(() => {
    if (wallet?.connected) {
      setUserCollectionReleasesCount(
        filterReleasesUserCollection().length || 0
      );
    }
  }, [releaseState]);

  return (
    <Typography variant="subtitle1">
      Your Collection ({userCollectionReleasesCount || 0})
    </Typography>
  );
};

const Breadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState(null);

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split('/');
      linkPath.shift();
      
      let pathArray;

      console.log('router.pathname :>> ', router.pathname);

      switch (router.pathname) {
        case '/[releasePubkey]':
          pathArray = linkPath.map((path, i) => {
            const metadata = router.components[`${router.pathname}`].props.pageProps.metadata
            const slug = `${metadata.properties.artist}, ${metadata?.properties.title}`
            return {breadcrumb: slug, href: '/' + linkPath.slice(0, i + 1).join('/')};
          });
          break;
        case '/[releasePubkey]/market':
          pathArray = linkPath.map((path, i) => {
            if (i === 0) {
              const metadata = router.components[`${router.pathname}`].props.pageProps.metadata
              const slug = `${metadata.properties.artist}, ${metadata?.properties.title}`
              return {breadcrumb: slug, href: '/' + linkPath.slice(0, i + 1).join('/')};
            }
            return {breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/')};
          });
          break;
      
        default:
          pathArray = linkPath.map((path, i) => {
            return {breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/')};
          });
          break;
      }

      setBreadcrumbs(pathArray);
    }
  }, [router]);

  if (!breadcrumbs) {
    return null;
  }

  return (
    <BreadcrumbsContainer aria-label="breadcrumbs">
      <ol className="breadcrumbs__list">
        <li>
          <span>/</span>
           <a href="/">Home</a>
        </li>
        {breadcrumbs.map((breadcrumb, i) => {
          return (
            <li key={breadcrumb.href}>
              <span>/</span>
              <Link href={breadcrumb.href}>
                <a>
                  {breadcrumb.breadcrumb} 
                </a>
              </Link>
            </li>
          );
        })}
      </ol>
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled(Box)(({theme}) => ({
  padding: theme.spacing(0, 2),
  fontSize: "10px",
  display: "flex",
  position: "absolute",
  top: "12px",
  "& .breadcrumbs__list": {
    display: "flex",
    margin: 0,
    paddingLeft: '20px',
    '& li': {
      textTransform: 'capitalize !important',
      display: 'flex',
      '& span': {
        padding: '0 10px'
      }
    }
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const StyledReleaseBreadcrumb = styled("div")(() => ({
  display: "block",
  paddingRight: "1px",
  maxWidth: "200px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  lineHeight: "1",
}));

export default Breadcrumbs;