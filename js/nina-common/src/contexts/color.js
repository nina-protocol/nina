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

