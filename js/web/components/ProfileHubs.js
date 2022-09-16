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
import { Typography } from '@mui/material'
import { styled } from '@mui/material'

const { getImageFromCDN, loader } = imageManager

const ProfileHubs = ({ profileHubs }) => {
  const profileHubsCategories = ['', 'Name', 'Description']
  return (
    <ResponsiveContainer>
      <TableContainer>
        <Table>
          <HubsTableHead tableCategories={profileHubsCategories} />
          <TableBody>
            {profileHubs.map((hub) => (
              <Link href={`/hubs/${hub.handle}`} passHref>
                <TableRow hover key={hub.handle}>
                  <StyledTableCell align="left">
                    <Box sx={{ width: '50px' }} align="left">
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
                    </Box>
                  </StyledTableCell>
                  <StyledTableCellNameContainer align="left">
                    <OverflowContainer>
                      <Typography noWrap>{hub.json.displayName} </Typography>
                    </OverflowContainer>
                  </StyledTableCellNameContainer>
                  <HubDescription description={hub.json.description} />
                </TableRow>
              </Link>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveContainer>
  )
}

const HubsTableHead = ({ tableCategories }) => {
  return (
    <TableHead>
      <TableRow>
        {tableCategories.map((category) => (
          <StyledTabContainer key={category}>
            <Typography sx={{ fontWeight: 'bold' }}>{category}</Typography>
          </StyledTabContainer>
        ))}
      </TableRow>
    </TableHead>
  )
}

const HubDescription = ({ description }) => {
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

  return (
    <StyledTableCell align="left">
      <StyledTableDescriptionContainer>
        <Typography noWrap>{hubDescription}</Typography>
      </StyledTableDescriptionContainer>
    </StyledTableCell>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
    maxHeight: '50px',
  },
}))

const StyledTabContainer = styled(Box)(({ theme }) => ({
  fontWeight: 'bold',
  borderBottom: 'none',
  padding: '5px 0',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
    maxHeight: '50px',
  },
}))

const StyledTableCellNameContainer = styled(Box)(({ theme }) => ({
  padding: '5px 0',
  maxWidth: '20vw',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
    maxHeight: '50px',
  },
}))

const StyledTableDescriptionContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '20vw',
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
  minHeight: '50vh',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

const OverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

export default ProfileHubs
