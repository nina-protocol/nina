import React from 'react'
import { styled } from '@mui/material/styles'
import { Box} from '@mui/material'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {Typography} from '@material-ui/core';
import {Link} from 'react-router-dom'
import SmoothImage from 'react-smooth-image'
import CircularProgress from '@mui/material/CircularProgress';


const RecentlyPublished = (props) => {
  const {releases} = props
  console.log('releases :>> ', releases);
  const responsive = {
    desktop: {
      breakpoint: {max: 3000, min: 1024},
      items: 3,
    },
    tablet: {
      breakpoint: {max: 1024, min: 464},
      items: 2,
    },
    mobile: {
      breakpoint: {max: 464, min: 0},
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    }
  };

  if (releases === undefined || releases.length ===  0 ) {
    return(
      <RecentlyPublishedContainer sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress color="black" />
      </RecentlyPublishedContainer>
    )
  }
  return (
    <RecentlyPublishedContainer>
      {releases?.length > 0 && 
        <Carousel
          showDots={false}
          responsive={responsive}
          infinite={true}
          autoPlay={false}
          autoPlaySpeed={1000}
          keyBoardControl={true}
          // customTransition="all .5"
          transitionDuration={500}
          slidesToSlide={1}
          containerClass="carousel-container"
          removeArrowOnDeviceType={["tablet", "mobile"]}
        >
          {releases.map((release, i) => {
            const imageUrl = release.metadata.image
            const artistInfo = <Typography variant="body2">{release.metadata.properties.artist}, {release.metadata.properties.title}</Typography>
            const availability = <Typography variant="body2">{release.tokenData.remainingSupply.toNumber()} / {release.tokenData.totalSupply.toNumber()}</Typography>
           
            return(
              <ReleaseSlide key={i}>
                <Link to={'/release/' + release.releasePubkey}>
                  <SmoothImage src={imageUrl}/>
                </Link>
                  {artistInfo}
                  {availability}
              </ReleaseSlide> 
            )
          })}
        </Carousel>
      }
    </RecentlyPublishedContainer>
  )
}

const RecentlyPublishedContainer = styled(Box)(() => ({
  width: '100%',
  minHeight: '250px',
}))

const ReleaseSlide = styled(Box)(() => ({
  width: '250px',
  textAlign: 'left',
  '& img': {
    width: '100%'
  }
}))

export default RecentlyPublished;