import { useContext } from 'react'
import { Box, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { Typography } from '@mui/material'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'
import { Button } from '@mui/material'
const TabHeader = ({
  activeView,
  profileTabs,
  viewHandler,
  type,
  releaseData,
}) => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { enqueueSnackbar } = useSnackbar()
  const playAllHandler = (playlist) => {
    console.log('playlist', playlist)
    if (type === 'hubView') {
      resetQueueWithPlaylist(
        playlist?.map((release) => release.releasePubkey)
      ).then(() =>
        enqueueSnackbar(`Hub releases added to queue`, {
          variant: 'info',
        })
      )
    } else {
      resetQueueWithPlaylist(
        playlist?.map((release) => release.publicKey)
      ).then(() =>
        enqueueSnackbar(`Releases added to queue`, {
          variant: 'info',
        })
      )
    }
  }
  const truncateCount = (count) => {
    let countString = count.toString()
    let countDigits = countString.replace(/[^0-9]/g, '').length
    return countDigits > 2 ? `${countString.substring(0, 3)}...` : countString
  }
  return (
    <ResponsiveContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'scroll',
          pb: 1,
        }}
      >
        {profileTabs?.map((tab, index) => {
          return (
            <>
              <ResponsiveTabWrapper key={index} sx={{}}>
                <ResponsiveTab
                  disabled={tab.disabled}
                  onClick={viewHandler}
                  id={index}
                  className={index === 0 ? 'first' : ''}
                >
                  <Typography
                    sx={{
                      fontWeight: `${activeView === index ? 'bold' : ''}`,
                      display: 'flex',
                      flexDirection: 'row',
                      marginRight: '6px',
                      width: '100%',
                    }}
                    id={index}
                    noWrap
                  >
                    {`${tab.name} (${truncateCount(tab.count)})`}
                  </Typography>

                  {tab.playlist && (
                    <PlayCircleOutlineIconButtonWrapper
                      disabled={tab.disabled}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        type === 'hubView'
                          ? playAllHandler(releaseData)
                          : playAllHandler(tab.playlist)
                      }}
                    >
                      <PlayCircleOutlineOutlinedIcon
                        sx={{ p: '0 !important', m: '0 !important' }}
                      />
                    </PlayCircleOutlineIconButtonWrapper>
                  )}
                </ResponsiveTab>
              </ResponsiveTabWrapper>
            </>
          )
        })}
      </Box>
    </ResponsiveContainer>
  )
}

const ResponsiveTabWrapper = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  textTransform: 'uppercase',
}))

const ResponsiveTab = styled(Button)(({ theme }) => ({
  cursor: 'pointer',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  textTransform: 'uppercase',
  color: theme.palette.text.primary,
  height: '40px',
  '&:disabled': {
    cursor: 'default !important',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '50vw',
    justifyContent: 'left',
    
  },
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  minWidth: '50vw',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'start',
  paddingTop: '0px',
  borderBottom: 1,
  borderColor: 'divider',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100vw',
    borderBottom: `1px solid ${theme.palette.greyLight}`,
    paddingLeft: '6px',
    height: '100%',
  },
}))

const PlayCircleOutlineIconButtonWrapper = styled(Button)(({ theme }) => ({
  m: 0,
  color: 'black',
  paddingRight: 0,
  paddingLeft: 0,
  
}))

export default TabHeader
