import { Button, Box, Tabs, Tab } from '@mui/material'
const HubToggle = ({ releaseClick, collaboratorClick }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider',   p: 1,
    m: 1,}}>
      <Tabs>
        <Tab onClick={releaseClick} label="Releases"  value='Releases'/>
        <Tab onClick={collaboratorClick} label="Collaborators" value="Collaborators" />
      </Tabs>
    </Box>
  )
}

export default HubToggle
