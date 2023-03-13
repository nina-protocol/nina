import React from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import NinaBox from '@nina-protocol/nina-internal-sdk/esm/NinaBox'
const LearnMore = () => {
  return (
    <StyledGrid>
      <NinaBox>
        <LearnMoreWrapper>
          <Typography variant="h1">Learn More</Typography>
          <Typography variant="h2">
            {`Nina is an independent music ecosystem that offers artists new models
          for releasing music. Below you can learn more about how it works and
          see a list of FAQs.`}
          </Typography>
          <Typography variant="h2">{`How You Can Use Nina`}</Typography>
          <Box sx={{}}>
            <Typography variant="h3">{`Limited Editions`}</Typography>
            <Typography variant="">
              {`Release a limited quantity of your release. You can set the number
              of editions you want to release when publishing.`}
            </Typography>
          </Box>
        </LearnMoreWrapper>
      </NinaBox>
    </StyledGrid>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '85%',
    },
  },
}))

const LearnMoreWrapper = styled(Box)(() => ({
  width: '100%',

  margin: '0px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',

  maxWidth: '506px',
  textAlign: 'left',
  paddingLeft: '16px',
  paddingRight: '16px',
}))

export default LearnMore
