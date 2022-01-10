import React, { createContext, useContext, useState, useMemo} from 'react'

import NinaClient from '../utils/client'
// import { postTwitterRegistrarRequest } from '../utils/web3'
// import { ConnectionContext } from './connection'
// import { ReleaseContext } from './release'

export const ColorContext = createContext()
const ColorContextProvider = ({ mode, setMode, children }) => {

  console.log('mode :>> ', mode);

  const colorModeToggle = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // const theme = React.useMemo(
  //   () =>
  //     createTheme({
  //       palette: {
  //         colorMode,
  //       },
  //     }),
  //   [mode],
  // );


  return (
    <ColorContext.Provider
      value={{
        mode,
        colorModeToggle
      }}
    >
      {children}
    </ColorContext.Provider>
  )
}
export default ColorContextProvider

const colorContextHelper = ({

}) => {
  // Name Service

  const findRegistrationTweet = async () => {
    const result = await fetch(
      `${
        NinaClient.endpoints.api
      }/api/twitter/verify?publicKey=${wallet.publicKey.toBase58()}`
    )
    return result.json()
  }

  return {
    findRegistrationTweet,
  }
}
