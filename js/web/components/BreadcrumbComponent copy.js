import React, { useContext, useState, useEffect } from "react";
import Breadcrumbs from 'nextjs-breadcrumbs';
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useWallet } from "@solana/wallet-adapter-react";
import { Typography, Box } from "@mui/material";
import Router, {withRouter, useRouter} from "next/router";


const { ReleaseContext } = ninaCommon.contexts;

// const ReleaseBreadcrumb = ({ match }) => {
//   const { releaseState } = useContext(ReleaseContext);
//   const release = releaseState.metadata[match.params.releasePubkey];
//   if (release) {
//     return (
//       <StyledReleaseBreadcrumb>
//         <Typography display="inline" variant="subtitle1">
//           {release.properties.artist},
//         </Typography>{" "}
//         <Typography
//           display="inline"
//           variant="subtitle1"
//           sx={{ fontStyle: "italic" }}
//         >
//           {release.properties.title}
//         </Typography>
//       </StyledReleaseBreadcrumb>
//     );
//   }
//   return null;
// };

// const YourCollectionBreadcrumb = () => {
//   const {
//     releaseState,
//     getReleasesPublishedByUser,
//     filterReleasesUserCollection,
//   } = useContext(ReleaseContext);
//   const wallet = useWallet();

//   const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
//     useState();
//   useEffect(() => {
//     if (wallet?.connected) {
//       getReleasesPublishedByUser(wallet.publicKey);
//     }
//   }, [wallet?.connected]);

//   useEffect(() => {
//     if (wallet?.connected) {
//       setUserCollectionReleasesCount(
//         filterReleasesUserCollection().length || 0
//       );
//     }
//   }, [releaseState]);

//   return (
//     <Typography variant="subtitle1">
//       Your Collection ({userCollectionReleasesCount || 0})
//     </Typography>
//   );
// };

// const YourReleasesBreadcrumb = () => {
//   const {
//     releaseState,
//     getReleasesPublishedByUser,
//     filterReleasesPublishedByUser,
//   } = useContext(ReleaseContext);
//   const wallet = useWallet();

//   const [userPublishedReleasesCount, setUserPublishedReleasesCount] =
//     useState();
//   useEffect(() => {
//     if (wallet?.connected) {
//       getReleasesPublishedByUser(wallet.publicKey);
//     }
//   }, [wallet?.connected]);

//   useEffect(() => {
//     if (wallet?.connected) {
//       setUserPublishedReleasesCount(
//         filterReleasesPublishedByUser().length || 0
//       );
//     }
//   }, [releaseState]);

//   return (
//     <Typography variant="subtitle1">
//       Your Releases ({userPublishedReleasesCount})
//     </Typography>
//   );
// };


const BreadcrumbComponent = ({router}) => {
  
  
  
  const breadCrumbFormatter = (router, title) => {
    let formattedBreadCrumb;
    console.log('here');
    switch (router.pathname) {
      case "/[releasePubkey]":
        formattedBreadCrumb =
        <>
          <Typography variant='subtitle1'>
            {<span>/</span>}{router.query.artist}, {router.query.title}
          </Typography>
        </>
        break;
    
      default:
        formattedBreadCrumb = 
        <Typography variant='subtitle1'>
          {<span>/</span>}{title}
        </Typography>
        break;
    }
    return formattedBreadCrumb
  }


  return(
    <BreadcrumbsContainer>
      <Breadcrumbs
        listStyle={{listStyle: "none"}}
        listClassName="BreadCrumbList"
        labelsToUppercase
        router={router}
        transformLabel={(title) => {
          console.log('router :>> ', router);
          console.log('title :>> ', title);
          return(
            breadCrumbFormatter(router, title)
          )
          }
        }
      />
    </BreadcrumbsContainer>
  )
}


const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  fontSize: "10px",
  display: "flex",
  position: "absolute",
  top: "12px",
  "& .BreadCrumbList": {
    display: "flex",
    margin: 0,
    paddingLeft: '20px',
    '& li': {
      textTransform: 'capitalize',
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

export default withRouter(BreadcrumbComponent);
