// import React from "react"
import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import Hub from '../contexts/Hub'
import Nina from '../contexts/Nina'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import HubCreateForm from './HubCreateForm'
import HubCreateConfirm from './HubCreateConfirm'
import NinaBox from './NinaBox'
import HubImageDropzone from './HubImageDropzone'
import Dots from './Dots'
import BundlrModal from './BundlrModal'
import EmailCapture from './EmailCapture'

const ColorModal = dynamic(() => import('./ColorModal'), { ssr: false })

import {
  createUpload,
  updateUpload,
  removeUpload,
  UploadType,
  uploadHasItemForType,
} from '../utils/uploadManager'

const HubCreateSchema = Yup.object().shape({
  handle: Yup.string().required('Hub Handle is Required'),
  displayName: Yup.string().required('Display Name is Required'),
  publishFee: Yup.number().required('Publish Fee is Required'),
  referralFee: Yup.number().required('Referral Fee is Required'),
  description: Yup.string(),
})

export default function HubCreate({ update, hubData }) {
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const {
    hubInitWithCredit,
    hubState,
    hubUpdateConfig,
    getHubs,
    validateHubHandle,
  } = useContext(Hub.Context)
  const router = useRouter()
  const {
    healthOk,
    bundlrUpload,
    bundlrBalance,
    getBundlrBalance,
    bundlrFund,
    bundlrWithdraw,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    getNpcAmountHeld,
    npcAmountHeld,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)


  const [artwork, setArtwork] = useState()
  const [uploadSize, setUploadSize] = useState()
  const [hubPubkey, setHubPubkey] = useState(hubData?.publicKey || undefined)
  const [buttonText, setButtonText] = useState(
    update ? 'Update Hub' : 'Create Hub'
  )
  const [pending, setPending] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [formValues, setFormValues] = useState({
    hubForm: {},
  })
  const [backgroundColor, setBackgroundColor] = useState()
  const [textColor, setTextColor] = useState()
  const [formValuesConfirmed, setFormValuesConfirmed] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hubInfo, setHubInfo] = useState()
  const [artworkTx, setArtworkTx] = useState()
  const [metadataTx, setMetadataTx] = useState()
  const [hubCreated, setHubCreated] = useState(false)
  const [hubUpdated, setHubUpdated] = useState(false)
  const [uploadId, setUploadId] = useState()
  const [hubHandleValid, setHubHandleValid] = useState(false)
  const [publishingStepText, setPublishingStepText] = useState()

  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  )
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )

  return <Box>Hub Create</Box>
}
