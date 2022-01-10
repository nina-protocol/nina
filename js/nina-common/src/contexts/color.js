import React, { createContext, useContext, useState, useMemo} from 'react'
import NinaClient from '../utils/client'

export const ColorContext = createContext()
const ColorContextProvider = ({ mode, setMode, children }) => {

  const colorModeToggle = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

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
