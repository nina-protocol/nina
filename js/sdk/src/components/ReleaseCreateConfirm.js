import React, {
  useState,
  useEffect,
  createElement,
  Fragment,
  useContext,
} from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { InputLabel, MenuItem, OutlinedInput } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import { parseChecker } from '../utils'
import Nina from '../contexts/Nina'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '100vh',
  overflowY: 'scroll',
}
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const ReleaseCreateConfirm = (props) => {
  const {
    formIsValid,
    formValues,
    handleSubmit,
    setFormValuesConfirmed,
    profileHubs,
    selectedHub,
    handleChange,
    hubPubkey,
    awaitingPendingReleases,
  } = props
  const { ninaClient } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const [sortedHubs, setSortedHubs] = useState([])
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [description, setDescription] = useState()
  const [confirm, setConfirm] = useState()
  const data = formValues.releaseForm
  const paymentMint = data.isUsdc
    ? ninaClient.ids.mints.usdc
    : ninaClient.ids.mints.wsol
  const submitAndCloseModal = (e) => {
    e.preventDefault()
    setFormValuesConfirmed(true)
    handleSubmit(e)
    handleClose()
  }

  useEffect(() => {
    if (data.description) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(parseChecker(data.description))
        .then((file) => {
          setDescription(file.result)
        })
    }
  }, [data.description])

  useEffect(() => {
    if (profileHubs) {
      const sortedHubs = profileHubs.sort((a, b) => {
        return a.datetime < b.datetime
      })
      setSortedHubs(sortedHubs)
    }
  }, [profileHubs])

  const handleChangeCheckbox = (e) => {
    setConfirm(e.target.checked)
  }
  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handleOpen}
        disabled={!formIsValid || awaitingPendingReleases}
      >
        {' '}
        {!awaitingPendingReleases
          ? 'Publish Release'
          : 'New Releases Cannot Be Uploaded Until Pending Releases Are Finalized'}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h4">
            Please double check the following information before publishing your
            Release:
            {selectedHub?.publicKey}
          </Typography>
          <Box>
            <Value sx={{ mt: 1 }}>
              Artist: <span>{data.artist}</span>
            </Value>
            <Value sx={{ mt: 1 }}>
              Title: <span>{data.title}</span>
            </Value>

            <Value sx={{ mt: 1 }}>
              Catalog Number:<span>{data.catalogNumber}</span>
            </Value>
            <Value sx={{ mt: 1 }}>
              Edition Size:{' '}
              <span>{data.isOpen ? 'Unlimited' : data.amount}</span>
            </Value>
            <Value sx={{ mt: 1 }}>
              Retail Price:
              <span>
                {data.retailPrice > 0
                  ? `${ninaClient.nativeToUiString(
                      ninaClient.uiToNative(data.retailPrice, paymentMint),
                      paymentMint
                    )}`
                  : 'Free'}
              </span>
            </Value>
            <Value sx={{ mt: 1, mb: 1 }}>
              Resale Percentage: <span>{data.resalePercentage}%</span>
            </Value>
            <Value
              className="description"
              sx={{ mt: 1, flexDirection: 'column', mb: 1 }}
            >
              Description:{' '}
              <span
                style={{
                  marginTop: '8px',
                  paddingLeft: '0',
                  maxHeight: '80px',
                }}
              >
                {description}
              </span>
            </Value>
            {!hubPubkey && (
              <FormControl sx={{ mt: 1, mb: 1, width: '100%' }}>
                <InputLabel id="demo-multiple-checkbox-label">
                  Select Hub
                </InputLabel>
                <Select
                  value={selectedHub}
                  onChange={handleChange}
                  input={<OutlinedInput label="Name" />}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {sortedHubs?.map((hub) => (
                    <MenuItem
                      key={hub?.handle}
                      value={`${hub?.publicKey}`}
                      id={hub?.publicKey}
                      name={hub?.data.displayName}
                    >
                      {hub?.data?.displayName}
                    </MenuItem>
                  ))}
                  <MenuItem value={''} name={'None'}>
                    {'None (Not Recommended)'}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
            <StyledModalWarningTypography variant="subtitle1">
              ONCE PUBLISHED, YOUR RELEASE INFORMATION WILL BE PERMANENT AND YOU
              WILL NOT BE ABLE TO EDIT IT.
            </StyledModalWarningTypography>
            <Value>
              <FormControlLabel
                sx={{ mt: 1, mb: 1 }}
                control={<Checkbox onChange={handleChangeCheckbox} />}
                label="Confirm"
              />
            </Value>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              disabled={!confirm}
              onClick={submitAndCloseModal}
            >
              Publish Release
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleClose}
              sx={{ marginTop: '15px !important' }}
            >
              Close and Edit
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}

const Value = styled(Typography)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  '& span': {
    textAlign: 'right',
  },

  '&.description': {
    '& span': {
      paddingLeft: theme.spacing(1),
      textAlign: 'left',
      maxHeight: '150px',
      overflowY: 'scroll',
    },
  },
}))

const StyledModalWarningTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.red,
  marginTop: 1,
}))

export default ReleaseCreateConfirm
