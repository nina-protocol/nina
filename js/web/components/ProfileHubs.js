import { Box } from '@mui/system'
import Image from 'next/image'
import Link from 'next/link'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useState, useEffect, createElement, Fragment } from 'react'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'

const { getImageFromCDN, loader } = imageManager

const ProfileHubss = ({ profileHubs, description }) => {
  if (profileHubs.length === 0) return <Box>No hubs belong to this address</Box>
  return <ProfileHubs profileHubs={profileHubs} description={description} />
}

const ProfileHubs = ({ profileHubs }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 'bold', borderBottom: 'none' }}
            ></TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>
              Name
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>
              Description
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>
              URL
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {profileHubs.map((hub) => (
            <TableRow
              hover
              key={hub.handle}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                height: '50px',
              }}
            >
              <TableCell component="th" scope="row">
                <Box sx={{ width: '50px' }}>
                  <Link href={`/hubs/${hub.handle}`} passHref prefetch>
                    <a>
                      <Image
                        height={'100%'}
                        width={'100%'}
                        layout="responsive"
                        src={getImageFromCDN(
                          hub.json.image,
                          400,
                          new Date(Date.parse(hub.createdAt))
                        )}
                        alt={hub.handle}
                        priority={true}
                        loader={loader}
                      />
                    </a>
                  </Link>
                </Box>
              </TableCell>
              <TableCell align="left">
                {' '}
                <Link href={`/hubs/${hub.handle}`} passHref prefetch>
                  <a>{hub.json.displayName} </a>
                </Link>
              </TableCell>
              <TableCell align="left">
                {' '}
                <Link href={`/hubs/${hub.handle}`} passHref prefetch>
                  <HubDescription description={hub.json.description} />
                </Link>
              </TableCell>
              <TableCell align="left">
                {' '}
                <Link href={`/hubs/${hub.handle}`} passHref prefetch>
                  <a>
                    {hub.json.externalUrl.substring(
                      8,
                      hub.json.externalUrl.length
                    )}{' '}
                  </a>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const HubDescription = ({description}) => {
  const [hubDescription, setHubDescription] = useState()
  useEffect(() => {
    if (description?.includes('<p>')) {
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
        .process(JSON.parse(description).replaceAll('<p><br></p>', '<br>'))
        .then((file) => {
          setHubDescription(file.result)
        })
    } else {
      setHubDescription(description)
    }
  }, [description])

  const descriptionFilter = (desc) => {
    return desc?.length > 24 ? `${desc.substring(0, 24)}...` : desc
  }

  return (
    <>
      <a>{descriptionFilter(hubDescription)}</a>
    </>
  )
}

export default ProfileHubs
