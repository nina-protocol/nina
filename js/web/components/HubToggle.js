import { Button, Box, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
const HubToggle = ({
  releaseClick,
  collaboratorClick,
  isClicked,
  onPlayReleases,
}) => {
  return (
    <ResponsiveContainer
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, py: 1, pl:1 }}>
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
            sx={{ pr: 1.5, pl: 0.5 }}
          />
        </Box>
        <Box
          onClick={collaboratorClick}
          sx={{
            cursor: 'pointer',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            textTransform: 'uppercase',
            fontWeight: `${isClicked === 'collaborators' ? 'bold' : ''}`,
          }}
        >
          <a>Collaborators</a>
        </Box>
      </Box>
    </ResponsiveContainer>
  )
}

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
export default HubToggle
