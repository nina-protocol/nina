import React from 'react'
import { styled } from '@mui/material/styles'
import nina from '@nina-protocol/nina-sdk'
import Box from '@mui/material/Box'
import Slider from 'react-slick'
import { isMobile } from 'react-device-detect'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Image from 'next/image'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import Dots from './Dots'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { getImageFromCDN, loader } = nina.utils.imageManager;

const RecentlyPublished = (props) => {
  const { releases } = props

  const responsiveSettings = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ]

  const CustomNextArrow = ({ onClick }) => (
    <NavigateNextIcon
      className="sliderArrow sliderArrow--right"
      onClick={onClick}
    />
  )
  const CustomPrevArrow = ({ onClick }) => (
    <NavigateBeforeIcon
      className="sliderArrow sliderArrow--left"
      onClick={onClick}
    />
  )

  if (releases.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '250px',
        }}
      >
        <Dots size="80px" />
      </Box>
    )
  }
  return (
    <RecentlyPublishedWrapper>
      {releases?.length > 0 && (
        <Slider
          dots={false}
          infinite={true}
          speed={1000}
          responsive={responsiveSettings}
          lazyLoad={true}
          slidesToShow={3}
          slidesToScroll={3}
          alignItems="left"
          nextArrow={<CustomNextArrow />}
          prevArrow={<CustomPrevArrow />}
        >
          {releases?.map((release, i) => {
            const imageUrl = release.metadata.image
            return (
              <ReleaseSlideWrapper key={i}>
                <ReleaseSlide key={i}>
                  <Link href={`/${release.releasePubkey}`}>
                    <a>
                      <Image
                        src={getImageFromCDN(imageUrl, 400)}
                        loader={loader}
                        height={100}
                        width={100}
                        layout="responsive"
                        priority={!isMobile}
                      />
                    </a>
                  </Link>
                  <ReleaseCopy sx={{ display: 'flex' }}>
                    <Typography variant="body2">
                      {release.metadata.properties.artist},{' '}
                      <i>{release.metadata.properties.title}</i>
                    </Typography>
                  </ReleaseCopy>
                </ReleaseSlide>
              </ReleaseSlideWrapper>
            )
          })}
        </Slider>
      )}
    </RecentlyPublishedWrapper>
  )
}

const RecentlyPublishedWrapper = styled(Box)(({ theme }) => ({
  // border: '2px solid red',
  '& .sliderArrow': {
    top: '-12% !important',
    position: 'absolute',
    cursor: 'pointer',
    '&--right': {
      right: '25px',
      [theme.breakpoints.down('md')]: {
        right: '9px',
      },
    },
    '&--left': {
      right: '70px',
      [theme.breakpoints.down('md')]: {
        right: '50px',
      },
    },
  },
  '& .MuiSvgIcon-root': {
    [theme.breakpoints.down('md')]: {
      top: '-21% !important',
    },
  },
}))

const ReleaseSlideWrapper = styled(Box)(() => ({
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    border: '2px solid red !important',
  },
}))

const ReleaseSlide = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  padding: '0 30px',
  margin: 'auto',
  '& a': {
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    width: '135px',
    padding: '0',
    paddingLeft: '1px',
    margin: '0',
  },
}))

const ReleaseCopy = styled(Box)(() => ({
  '& p': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    padding: '10px 0 4px',
  },
}))
export default RecentlyPublished
