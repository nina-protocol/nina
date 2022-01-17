import React, { createContext, useContext, useState, useMemo} from 'react'

export const ColorContext = createContext()
const ColorContextProvider = ({ mode, setMode, children }) => {

  const colorModeToggle = React.useMemo(
    () => ({
      toggleColorMode: () => {
        localStorage.setItem('colorMode', mode === 'light' ? 'dark' : 'light');
        setMode(() => (mode === 'light' ? 'dark' : 'light'));
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

