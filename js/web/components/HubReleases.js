import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useContext } from 'react'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
const { getImageFromCDN, loader } = imageManager

const HubReleases = ({ hubReleases }) => {
  const hubReleasesCategories = ['', '', 'Artist', 'Title']
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    playlist,
    track,
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
    <ResponsiveContainer>
      <TableContainer>
        <Table>
          <HubTableHead tableCategories={hubReleasesCategories} />
          <TableBody sx={{ borderBottom: 'none' }}>
            {hubReleases.map((release) => (
              <Link href={`/${release.releasePubkey}`} passHref>
                <TableRow hover key={release.name}>
                  <StyledTableCell
                    align="left"
                    sx={{ width: '100px', textAlign: 'left' }}
                  >
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

const HubTableHead = ({ tableCategories }) => {
  return (
    <TableHead sx={{}}>
      <TableRow sx={{ py: 1 }}>
        {tableCategories.map((category) => (
          <StyledTableCell
            align="left"
            key={category}
            sx={{
              fontWeight: 'bold',
              borderBottom: 'none',
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>{category}</Typography>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',

  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
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

export default HubReleases
