import { useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { styled } from '@mui/material'
import { useSnackbar } from 'notistack'

const { getImageFromCDN, loader } = imageManager

const ProfileReleaseTableHead = ({ tableCategories }) => {
  return (
    <TableHead>
      <TableRow>
        {tableCategories?.map((category, i) => (
          <StyledTableCell
            align="left"
            key={i}
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

const ProfileReleaseTable = ({ allReleases, tableCategories }) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
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
          <ProfileReleaseTableHead tableCategories={tableCategories} />
          <TableBody>
            {allReleases.map((release, i) => (
              <Link key={i} href={`/${release.releasePubkey}`} passHref>
                <TableRow hover key={release.metadata.properties.name}>
                  <StyledTableCellButtonsContainer align="left">
                    <Button
                      sx={{ cursor: 'pointer' }}
                      id={release.releasePubkey}
                      key={release.metadata.properties.title}
                      onClickCapture={(e) =>
                        handleQueue(
                          e,
                          release.releasePubkey,
                          release.metadata.properties.title
                        )
                      }
                    >
                      <ControlPointIcon
                        sx={{ color: 'black' }}
                        key={release.metadata.properties.title}
                      />
                    </Button>
                    <Button
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClickCapture={(e) =>
                        handlePlay(e, release.releasePubkey)
                      }
                      id={release.releasePubkey}
                    >
                      {isPlaying &&
                      track.releasePubkey === release.releasePubkey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                          id={release.releasePubkey}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                        />
                      )}
                    </Button>
                  </StyledTableCellButtonsContainer>
                  <StyledTableCell align="left">
                    <Box sx={{ width: '50px', textAlign: 'left' }}>
                      <Image
                        height={'100%'}
                        width={'100%'}
                        layout="responsive"
                        src={getImageFromCDN(
                          release.metadata.image,
                          400,
                          Date.parse(release.metadata.properties.date)
                        )}
                        alt={release.metadata.properties.name}
                        priority={true}
                        loader={loader}
                      />
                    </Box>
                  </StyledTableCell>
                  <StyledTableCellArtistContainer align="left">
                    <OverflowContainer>
                      <Typography noWrap>
                        {release.metadata.properties.artist}
                      </Typography>
                    </OverflowContainer>
                  </StyledTableCellArtistContainer>
                  <StyledTableCellTitleContainer align="left">
                    <OverflowContainer>
                      <Typography noWrap>
                        {release.metadata.properties.title}
                      </Typography>
                    </OverflowContainer>
                  </StyledTableCellTitleContainer>
                </TableRow>
              </Link>
            ))}
            <TableRow sx={{ borderBottom: 'none' }}>
              <StyledTableCellBuffer />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveContainer>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '100px',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellArtistContainer = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',
  textAlign: 'left',
  maxWidth: '20vw',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const OverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

const StyledTableCellTitleContainer = styled(TableCell)(({ theme }) => ({
  textDecoration: 'underline',
  maxWidth: '20vw',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellBuffer = styled(TableCell)(({ theme }) => ({
  height: '50px',
  borderBottom: 'none',
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
  minHeight: '50vh',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

export default ProfileReleaseTable
