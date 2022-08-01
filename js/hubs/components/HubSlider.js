import React from 'react'
import { styled } from '@mui/material/styles'
import { getImageFromCDN, loader } from "@nina-protocol/nina-sdk/src/utils/imageManager";
import Box from '@mui/material/Box'
import { isMobile } from 'react-device-detect'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Image from "next/image";
import Dots from './Dots'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from 'next/dynamic';

const Slider = dynamic(() => import('react-slick'), {
  ssr: false,
  loading: () => (
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
  )})
const NavigateNextIcon = dynamic(() => import('@mui/icons-material/NavigateNext'))
const NavigateBeforeIcon = dynamic(() => import('@mui/icons-material/NavigateBefore'))

const HubSlider = (props) => {
  const { hubs } = props;

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
  if (hubs?.length === 0) {
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
    <HubSliderWrapper>
      {hubs?.length > 0 && (
        <Slider
          dots={false}
          infinite={true}
          speed={1000}
          responsive={responsiveSettings}
          slidesToShow={3}
          slidesToScroll={3}
          alignItems="left"
          nextArrow={<CustomNextArrow />}
          prevArrow={<CustomPrevArrow />}
        >
          {hubs?.map((hub, i) => {
            const imageUrl = hub?.json?.image;
            return (
              <HubSlideWrapper key={i}>
                <HubSlide key={i}>
                  {imageUrl &&
                    <Link href={`/${hub.handle}`}>
                      <a>
                        <Image
                          loader={loader}
                          src={getImageFromCDN(imageUrl, 400)}
                          height={100}
                          width={100}
                          layout="responsive"
                          priority={!isMobile}
                          alt={`${hub.handle}`}
                        />
                      </a>
                    </Link>
                  }
                  <HubCopy sx={{ display: "flex" }}>
                    <Typography variant="body2">
                      {hub?.json?.displayName}
                    </Typography>
                  </HubCopy>
                </HubSlide>
              </HubSlideWrapper>
            )
          })}
        </Slider>
      )}
    </HubSliderWrapper>
  )
}

const HubSliderWrapper = styled(Box)(({ theme }) => ({
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

const HubSlideWrapper = styled(Box)(() => ({
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    border: '2px solid red !important',
  },
}))

const HubSlide = styled(Box)(({ theme }) => ({
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

const HubCopy = styled(Box)(() => ({
  '& p': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    padding: '10px 0 4px',
  },
}))
export default HubSlider
