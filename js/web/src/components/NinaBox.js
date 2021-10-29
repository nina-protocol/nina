import Box from '@material-ui/core/Box'
import {styled} from '@mui/material/styles'

const NinaBox = ({children}) => (
  <StyledBox>
    {children}
  </StyledBox>
)

const StyledBox = styled(Box)(({theme}) => ({
  ...theme.helpers.grid,
  width: '765px',
  height: '547px',
  margin: 'auto',
  gridTemplateColumns: 'repeat(2, 1fr)',
  backgroundColor: theme.palette.white,
  border: '2px solid blue'
}))
export default NinaBox;