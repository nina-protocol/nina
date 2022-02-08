import React, { useContext } from 'react'
import { useFormik } from 'formik'
import nina from '@ninaprotocol/nina-sdk'
// import {useWallet} from "@solana/wallet-adapter-react";

const { HubContext } = nina.contexts

const HubAddArtist = (props) => {
  const { hubPubkey } = props

  const { hubAddArtist } = useContext(HubContext)

  const formik = useFormik({
    initialValues: {
      artist: '',
    },
    onSubmit: (values) => {
      hubAddArtist(values.artist, hubPubkey)
    },
  })
  return (
    <form
      onSubmit={formik.handleSubmit}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <label htmlFor="email">Artist (wallet address)</label>
      <input
        id="artist"
        name="artist"
        onChange={formik.handleChange}
        value={formik.values.artist}
      />

      <button type="submit">Submit</button>
    </form>
  )
}

export default HubAddArtist
