import { Box } from '@mui/system'
import Image from 'next/image'
import Link from 'next/link'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useState, useEffect, useContext, createElement, Fragment } from 'react'
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
import { Typography, Button } from '@mui/material'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'

const { getImageFromCDN, loader } = imageManager

const ProfileHubs = ({ profileHubs }) => {
  const {
    getHub,
    hubState,
    filterHubContentForHub,
    filterHubCollaboratorsForHub,
    hubContentState,
  } = useContext(Hub.Context)
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
    resetQueueWithPlaylist,
  } = useContext(Audio.Context)
  const { releaseState } = useContext(Release.Context)
  const [hubReleaseData, setHubReleaseData] = useState([])
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const playHubHandler = (e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('releaseState', releaseState)
    setHubReleaseData([releaseState])
    console.log('typeof releaseState', typeof releaseState)
    const mints = Object.keys(releaseState.releaseMintMap)
    resetQueueWithPlaylist(mints).then(() =>
      enqueueSnackbar(`Hub releases added to queue`, {
        variant: 'info',
      })
    )
  }
  console.log('profileHubs', profileHubs)
  return (
    <ResponsiveContainer>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell
                align="left"
                sx={{
                  fontWeight: 'bold',
                  borderBottom: 'none',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  p: 0,
                }}
              >
                {/* <Typography sx={{ fontWeight: 'bold' }}>Play All </Typography> */}
                <ResponsivePlayButton onClick={(e) => playHubHandler(e)}>
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
                </ResponsivePlayButton>
              </StyledTableCell>
              <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              >
                <Typography sx={{ fontWeight: 'bold' }}> Name</Typography>
              </StyledTableCell>
              <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>
                  Description
                </Typography>
              </StyledTableCell>
              {/* <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>URL</Typography>
              </StyledTableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {profileHubs.map((hub) => (
              <Link href={`/hubs/${hub.handle}`} passHref >
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
                  <StyledTableCell align="left" sx={{maxWidth:"20vw",}}>
                    <Typography>{hub.json.displayName} </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left" sx={{maxWidth:"20vw",}}>
                    <HubDescription description={hub.json.description} />
                  </StyledTableCell>
                  {/* <StyledTableCell
                    align="left"
                    sx={{ textDecoration: 'underline' }}
                  >
                    <Typography>
                      {hub.json.externalUrl.substring(
                        8,
                        hub.json.externalUrl.length
                      )}
                    </Typography>
                  </StyledTableCell> */}
                </TableRow>
              </Link>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveContainer>
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

  const descriptionFilter = (desc) => {
    return desc?.length > 24 ? `${desc.substring(0, 24)}...` : desc
  }

  return (
    <>
      <Typography>{descriptionFilter(hubDescription)}</Typography>
    </>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding:'5px 0',
  [theme.breakpoints.down('md')]: {
    padding:'0 5px'
  },
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: '960px',
  minHeight:'50vh',
  margin:'auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw'
  },
}))

const ResponsivePlayButton = styled(Button)(({ theme }) => ({
  mr: 3,
  pr: 3,
  cursor: 'pointer',
  [theme.breakpoints.down('md')]: {
    mr: 0,
    pr: 0,
  },
}))

const ResponsiveAudioControlContainer = styled(TableCell)(({ theme }) => ({
  padding: 0,
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'row',
  },
}))

export default ProfileHubs
