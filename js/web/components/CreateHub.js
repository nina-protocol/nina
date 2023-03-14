import React from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Button from '@mui/material/Button'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
const CreateHub = () => {
  return (
    <Link href="/hubs/create" passHref>
      <a>
        <CtaWrapper>
          <Button>
            <Box display="flex" alignItems="center">
              <AddIcon />
              <Typography ml={0.5} variant="body2">
                Create Hub
              </Typography>
            </Box>
          </Button>
        </CtaWrapper>
      </a>
    </Link>
  )
}

const CtaWrapper = styled(Box)(({ theme }) => ({
  '& button': {
    color: 'black',
    border: '1px solid black',
    borderRadius: '0px',
    margin: '0 8px',
    [theme.breakpoints.down('md')]: {
      border: 'none',
      margin: '0px',
      padding: '10px 10px 10px 0px',
      '& p': {
        display: 'none',
      },
    },
    '& svg': {
      fontSize: '16px',
      [theme.breakpoints.down('md')]: {
        fontSize: '20px',
      },
    },
  },
}))

export default CreateHub
