import { Button, Box, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'

const HubToggle = ({
  releaseClick,
  collaboratorClick,
  isReleaseClicked,
  isCollaboratorClicked,
}) => {
  return (
    <ResponsiveContainer
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
   
      }}
    >
      <Tabs>
        <StyledTab
          disableRipple
          onClick={releaseClick}
          label="Releases"
          value="Releases"
          sx={{ color: `${isReleaseClicked === 'releases' ? 'black' : ''}` }}
        />
        <StyledTab
          disableRipple
          onClick={collaboratorClick}
          label="Collaborators"
          value="Collaborators"
          sx={{
            color: `${
              isCollaboratorClicked === 'collaborators' ? 'black' : ''
            }`,
          }}
        />
      </Tabs>
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
const StyledTab = styled(Tab)(({theme}) => ({
  p:0,
}))
export default HubToggle
