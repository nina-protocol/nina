import { Button, Box, Tabs, Tab } from '@mui/material'
const HubToggle = ({ releaseClick, collaboratorClick, isReleaseClicked, isCollaboratorClicked }) => {
  return (
    <Box sx={{width:"50vw", borderBottom: 1, borderColor: 'divider', pb:1, px: 1, mx: 1, mb:1, display:"flex", flexDirection:"row", alignItems:'center', justifyContent:'center'}}>
      <Tabs>
        <Tab onClick={releaseClick} label="Releases"  value='Releases' sx={{color: `${isReleaseClicked === 'releases' ? 'black' : ''}`}}/>
        <Tab onClick={collaboratorClick} label="Collaborators" value="Collaborators" sx={{color: `${isCollaboratorClicked  === 'collaborators' ? 'black' : ''}`}} />
      </Tabs>
    </Box>
  )
}

export default HubToggle
