import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {styled} from "@mui/material/styles";
import {Typography, Box} from "@mui/material";


const convertBreadcrumb = string => {
  return string
    .replace(/-/g, ' ')
    .replace(/oe/g, 'ö')
    .replace(/ae/g, 'ä')
    .replace(/ue/g, 'ü')
    .toUpperCase();
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

      if (router.pathname === '/[releasePubkey]') {
         pathArray = linkPath.map((path, i) => {

           const metadata = router.components[`${router.pathname}`].props.pageProps.metadata
           console.log('metadata :>> ', metadata);
           const slug = `${metadata.properties.artist}, ${metadata?.properties.title}`
          //  const slug = `test`
          return {breadcrumb: slug, href: '/' + linkPath.slice(0, i + 1).join('/')};
        });
      } else if (router.pathname === '/[releasePubkey]/market') {
        pathArray = linkPath.map((path, i) => {
          if (i === 0 ) {
            const metadata = router.components[`${router.pathname}`].props.pageProps.metadata
            const slug = `${metadata.properties.artist}, ${metadata?.properties.title}`
            return {breadcrumb: slug, href: '/' + linkPath.slice(0, i + 1).join('/')};
          }
          return {breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/')};
        });
      } else {
        pathArray = linkPath.map((path, i) => {
          return {breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/')};
        });
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
           <a href="/">HOME</a>
        </li>
        {breadcrumbs.map((breadcrumb, i) => {
          return (
            <li key={breadcrumb.href}>
              <span>/</span>
              <Link href={breadcrumb.href}>
                <a>
                  {convertBreadcrumb(breadcrumb.breadcrumb)} 
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
      textTransform: 'capitalize',
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