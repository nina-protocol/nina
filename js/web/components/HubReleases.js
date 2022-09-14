import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Paper from '@mui/material/Paper'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useContext } from 'react'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
const { getImageFromCDN, loader } = imageManager

const HubReleases = ({ hubReleases }) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    playlist,
    track,
    resetQueueWithPlaylist,
  } = useContext(Audio.Context)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, {
      persistent: 'true',
      variant: 'info',
    })
    setTimeout(() => closeSnackbar(snackbarMessage), 3000)
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('releasePubkey from the track', releasePubkey)
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleQueue = (e, releasePubkey, title) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }

  return (
    <ResponsiveContainer
      sx={{
        width: '100%',

        overflow: 'auto',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell
                sx={{
                  fontWeight: 'bold',
                  borderBottom: 'none',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  p: 0,
                }}
              >
                {/* <Typography sx={{ fontWeight: 'bold', width:'100%' }}>Play All </Typography> */}
                <ResponsivePlayButton
                  onClick={() =>
                    resetQueueWithPlaylist(
                      hubReleases.map((release) => release.releasePubkey)
                    ).then(() =>
                      enqueueSnackbar(`Releases added to queue`, {
                        variant: 'info',
                      })
                    )
                  }
                >
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
                </ResponsivePlayButton>
              </StyledTableCell>
              <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              ></StyledTableCell>
              <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>Artist</Typography>
              </StyledTableCell>
              <StyledTableCell
                sx={{ fontWeight: 'bold', borderBottom: 'none' }}
              >
                <Typography sx={{ fontWeight: 'bold' }}> Title</Typography>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderBottom: 'none' }}>
            {hubReleases.map((release) => (
              <Link href={`/${release.releasePubkey}`} passHref prefetch>
                <TableRow hover key={release.name}>
                  <StyledTableCell align="left">
                    <Button
                      sx={{ cursor: 'pointer' }}
                      id={release.releasePubkey}
                      key={release.properties.title}
                      onClickCapture={(e) =>
                        handleQueue(
                          e,
                          release.releasePubkey,
                          release.properties.title
                        )
                      }
                    >
                      <ControlPointIcon
                        sx={{ color: 'black' }}
                        key={release.properties.title}
                        onClickCapture={(e) =>
                          handleQueue(
                            e,
                            release.releasePubkey,
                            release.properties.title
                          )
                        }
                      />
                    </Button>

                    <ResponsivePlayButton
                      onClickCapture={(e) =>
                        handlePlay(e, release.releasePubkey)
                      }
                      id={release.releasePubkey}
                    >
                      {isPlaying &&
                      track.releasePubkey === release.releasePubkey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                          onClickCapture={(e) =>
                            handlePlay(e, release.releasePubkey)
                          }
                          id={release.releasePubkey}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                        />
                      )}
                    </ResponsivePlayButton>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Box sx={{ width: '50px' }}>
                      <Image
                        height={'100%'}
                        width={'100%'}
                        layout="responsive"
                        src={getImageFromCDN(
                          release.image,
                          400,
                          new Date(Date.parse(release.properties.date))
                        )}
                        alt={release.name}
                        priority={true}
                        loader={loader}
                      />
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell sx={{ maxWidth: '20vw' }} align="left">
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Typography noWrap>
                        {release.properties.artist}{' '}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell
                    sx={{ textDecoration: 'underline', maxWidth: '20vw' }}
                    align="left"
                  >
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Typography noWrap>{release.properties.title}</Typography>
                    </Box>
                  </StyledTableCell>
                </TableRow>
              </Link>
            ))}
            <TableRow sx={{ borderBottom: 'none' }}>
              <StyledTableCell
                sx={{ height: '50px', borderBottom: 'none' }}
              ></StyledTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveContainer>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',

  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: '960px',
  minHeight: '50vh',
  overflow: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    overflow: 'visible',
    mb: 10,
    pb: 10,
    maxHeight: '80vh',
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
export default HubReleases
