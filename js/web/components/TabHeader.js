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
  return (
    <ResponsiveContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'scroll',
          justifyContent: 'center',
          pb: 1,
          rowGap: 1,
        }}
      >
        {profileTabs?.map((tab, index) => {
          return (
            <>
              <ResponsiveTabWrapper
                key={index}
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  textTransform: 'uppercase',
                }}
              >
                <ResponsiveTab
                  disabled={tab.disabled}
                  onClick={viewHandler}
                  id={index}
                  className={index === 0 ? 'first' : ''}
                >
                  <ResponsiveTabTypography
                    sx={{
                      fontWeight: `${activeView === index ? 'bold' : ''}`,
                    }}
                    id={index}
                  >
                    {`${tab.name} (${tab.count})`}
                  </ResponsiveTabTypography>

                  {tab.playlist && (
                    <ResponsiveCircleOutlineIconContainer>
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
                        <PlayCircleOutlineOutlinedIcon />
                      </PlayCircleOutlineIconButtonWrapper>
                    </ResponsiveCircleOutlineIconContainer>
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
  '&:nth-of-type(1)': {
    '& button': {
      paddingLeft: '0px',
    },
  },
}))

const ResponsiveTab = styled(Button)(({ theme }) => ({
  cursor: 'pointer',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',

  textTransform: 'uppercase',
  color: theme.palette.text.primary,
  paddingRight: '15px',
  height: '40px',
  '&:disabled': {
    cursor: 'default !important',
  },

  [theme.breakpoints.down('md')]: {},
}))

const ResponsiveTabTypography = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    fontSize: '11.5px !important',
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
  },
}))

const PlayCircleOutlineIconButtonWrapper = styled(Button)(({ theme }) => ({
  m: 0,
  color: 'black',
  paddingRight: 0,
  [theme.breakpoints.down('md')]: {
    paddingRight: '3px',
  },
}))

const ResponsiveCircleOutlineIconContainer = styled(Box)(({ theme }) => ({
  paddingRight: 1.5,
  paddingLeft: '5px',
  paddingTop: '1px',
  '& button': {
    padding: '0px',
  },
  '&:hover': {
    opacity: 0.5,
  },
  [theme.breakpoints.down('md')]: {
    paddingRight: '3px',
  },
}))

export default TabHeader
