import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { useState, useEffect, createElement, Fragment } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Box } from '@mui/system'
import Subscribe from './Subscribe'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import { useSnackbar } from 'notistack'

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubData }) => {
  const [hubDescription, setHubDescription] = useState(undefined)
  const wallet = useWallet()

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
    <Wrapper>
      <ResponsiveHubHeader>
        <Box sx={{ width: '100px', minWidth: '100px' }}>
          <Link href={`${hubData?.data.externalUrl}`} passHref>
            <a target="_blank" rel="noreferrer">
              <Image
                height={100}
                width={100}
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

        <CopyWrapper>
          <DisplayName>
            {hubData?.data.displayName && (
              <Link href={hubData?.data.externalUrl} passHref>
                <a target="_blank" rel="noreferrer">
                  <Typography sx={{ padding: '0 15px' }} >
                    {hubData?.data.displayName}
                  </Typography>
          
                </a>
              </Link>
            )}
            {wallet.connected && (
              <Subscribe
                accountAddress={hubData?.publicKey}
                hubHandle={hubData?.handle}
                inHub={true}
                inFeed={false}
              />
            )}
          </DisplayName>
          {hubData?.data.description && (
            <DescriptionOverflowContainer>
              {hubDescription}
            </DescriptionOverflowContainer>
          )}
        </CopyWrapper>
      </ResponsiveHubHeader>
    </Wrapper>
  )
}

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    marginBottom: '10px',
  },
}))

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
  '& img': {
    width: '100px',
  },
  [theme.breakpoints.down('md')]: {
    alignItems: 'left',
    paddingLeft: '15px',
    width: '100vw',
  },
}))

const DisplayName = styled(Box)(({ theme }) => ({
  maxWidth: '275px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  '& a': {
    overflow: 'hidden',
    display: ['-webkit-box'],
    ['-webkit-line-clamp']: '2',
    ['-webkit-box-orient']: 'vertical',
    marginBottom: '10px'
  },
  [theme.breakpoints.down('md')]: {
    width: 'auto',
    '& a': {
      marginBottom: '0px'
    },
  },
}))

const CopyWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: '80%',
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
  '& p': {
    margin: 0,
  },
  '& h1': {
    margin: 0,
  },
  '& h2': {
    margin: 0,
  },
  width: '100%',
  [theme.breakpoints.down('md')]: {
    ['-webkit-line-clamp']: '4',
    maxWidth: 'unset',
    padding: '0 15px',
    width: '68vw',
  },
}))

export default HubHeader
