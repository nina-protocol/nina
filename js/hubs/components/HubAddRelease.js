import React, { useContext } from 'react'
import { useFormik } from 'formik'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const HubAddRelease = (props) => {
  const { hubPubkey, canAddContent } = props
  const { enqueueSnackbar } = useSnackbar()

  const { hubAddRelease } = useContext(Hub.Context)

  const formik = useFormik({
    initialValues: {
      release: '',
    },
    onSubmit: async (values, { resetForm }) => {
      const error = await checkIfHasBalanceToCompleteAction(
        NinaProgramAction.HUB_ADD_RELEASE
      )
      if (error) {
        enqueueSnackbar(error.msg, { variant: 'failure' })
        return
      }

      const result = await hubAddRelease(hubPubkey, values.release)
      if (result?.success) {
        enqueueSnackbar(result.msg, {
          variant: 'info',
        })
      } else {
        enqueueSnackbar('Release Not Added', {
          variant: 'failure',
        })
      }
      resetForm()
    },
  })

  return (
    <Wrapper>
      <Typography align="left" fontWeight={600}>
        Add a release to your hub via release id
      </Typography>

      <form
        onSubmit={formik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <TextField
          fullWidth
          id="release"
          name="release"
          label="Release"
          onChange={formik.handleChange}
          value={formik.values.release}
          variant="standard"
          disabled={!canAddContent}
        />

        <Button
          style={{ marginTop: '15px' }}
          color="primary"
          variant="outlined"
          fullWidth
          type="submit"
          disabled={!canAddContent}
        >
          {canAddContent
            ? 'Submit'
            : 'You do not have permission to add releases'}
        </Button>
      </form>
    </Wrapper>
  )
}

const Wrapper = styled(Box)(() => ({
  textAlign: 'left',
  width: '500px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  margin: 'auto',
}))

export default HubAddRelease
