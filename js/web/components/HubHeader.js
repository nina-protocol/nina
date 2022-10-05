import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { useState, useEffect, createElement, Fragment } from 'react'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Box } from '@mui/system'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubData }) => {
  const [hubDescription, setHubDescription] = useState(undefined)
  useEffect(() => {
    if (hubData?.data.description.includes('<p>')) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(
          JSON.parse(hubData?.data.description).replaceAll(
            '<p><br></p>',
            '<br>'
          )
        )
        .then((file) => {
          setHubDescription(file.result)
        })
    } else {
      setHubDescription(hubData?.data.description)
    }
  }, [hubData?.data.description])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <ResponsiveHubHeader>
        <Box sx={{ width: '100px' }}>
          <Link href={`${hubData?.data.externalUrl}`} passHref>
            <a target="_blank" rel="noreferrer">
              <Image
                height={'100%'}
                width={'100%'}
                layout="responsive"
                src={getImageFromCDN(
                  hubData?.data?.image,
                  400,
                  Date.parse(hubData?.createdAt)
                )}
                alt={hubData?.data.displayName}
                priority={true}
                loader={loader}
              />
            </a>
          </Link>
        </Box>

        {hubData?.data.displayName && (
          <Link href={hubData?.data.externalUrl} passHref>
            <a target="_blank" rel="noreferrer">
              <Typography sx={{ px: 2 }}>
                {hubData?.data.displayName}
              </Typography>
            </a>
          </Link>
        )}
        {hubData?.data.description && (
          <>
            <DescriptionOverflowContainer>
              {hubDescription}
            </DescriptionOverflowContainer>
          </>
        )}
      </ResponsiveHubHeader>
    </Box>
  )
}

const ResponsiveHubHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '115px',
  flexDirection: 'row',
  alignItems: 'start',
  justifyContent: 'start',
  mb: 1,
  justifyContent: 'start',
  py: 5,
  px: 1,

  [theme.breakpoints.down('md')]: {
    alignItems: 'left',
    paddingLeft: '15px',

    width: '100vw',
  },
}))
const ResponsiveUrlContainer = styled(Box)(({ theme }) => ({
  paddingBottom: 2,
  fontSize: '12px',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '15px',
  },
}))

const DescriptionOverflowContainer = styled(Box)(({ theme }) => ({
  alignItems: 'start',
  textAlign: 'left',
  overflow: 'hidden',
  display: ['-webkit-box'],
  ['-webkit-line-clamp']: '6',
  ['-webkit-box-orient']: 'vertical',
  textOverflow: 'ellipsis',
  minWidth: '10vw',
  maxWidth: '50vw',
  '& p': {
    margin: 0,
  },
  '& h1': {
    margin: 0,
  },
  '& h2': {
    margin: 0,
  },
  [theme.breakpoints.down('md')]: {
    ['-webkit-line-clamp']: '6',
    width: '40vw',
  },
}))

export default HubHeader
