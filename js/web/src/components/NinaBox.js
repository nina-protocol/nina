import Box from '@material-ui/core/Box'
import {styled} from '@mui/material/styles'

const NinaBox = ({children, columns, justifyItems}) => (
  <StyledBox columns={columns} justifyItems={justifyItems}>
    {children}
  </StyledBox>
)

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop,
})(({theme, columns, justifyItems}) => ({
  ...theme.helpers.grid,
  justifyItems: justifyItems ? justifyItems : 'center',
  width: '765px',
  height: '547px',
  margin: 'auto',
  gridTemplateColumns: columns ? columns : 'repeat(2, 1fr)',
  backgroundColor: theme.palette.white,
  gridColumnGap: '0px',
  border: '2px solid blue',
  gridAutoRows: 'auto'
}))
export default NinaBox;