import { Box, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import { Typography } from '@mui/material'
const ProfileToggle = ({
  releaseClick,
  hubClick,
  collectionClick,
  isClicked,
  onPlayReleases,
  onPlayCollection,
}) => {
  return (
    <ResponsiveContainer sx={{ borderBottom: 1, borderColor: 'divider',}}>
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, pb: 1,pl:1  }}>
        <Box
          onClick={releaseClick}
          sx={{
            cursor: 'pointer',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            textTransform: 'uppercase',
            fontWeight: `${isClicked === 'releases' ? 'bold' : ''}`,
            
          }}
        >
          <a>Releases</a>
          <PlayCircleOutlineOutlinedIcon
            onClick={onPlayReleases}
            sx={{ pr: 1.5, pl:.5 }}
          />
        </Box>
        <Box
          onClick={collectionClick}
          sx={{
            cursor: 'pointer',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            textTransform: 'uppercase',
            fontWeight: `${isClicked === 'collection' ? 'bold' : ''}`,
          }}
        >
          <a>Collection</a>
          <PlayCircleOutlineOutlinedIcon
            onClick={onPlayCollection}
            sx={{ pr: 1.5, pl:.5 }}
          />
        </Box>
        <Box
          onClick={hubClick}
          sx={{
            cursor: 'pointer',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            textTransform: 'uppercase',
            fontWeight: `${isClicked === 'hubs' ? 'bold' : ''}`,
          }}
        >
          <a>Hubs</a>
        </Box>
      </Box>
    </ResponsiveContainer>
  )
}

const TabBox = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  textTransform: 'uppercase',
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  minWidth: '50vw',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'start',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  p: 0,
}))

export default ProfileToggle
