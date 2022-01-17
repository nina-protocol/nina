import React, { createContext } from 'react'

export const ColorContext = createContext()
const ColorContextProvider = ({ mode, setMode, children }) => {
  const colorModeToggle = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          localStorage.setItem('colorMode', newMode)
          return newMode
        })
      },
    }),
    []
  )

  return (
    <ColorContext.Provider
      value={{
        mode,
        colorModeToggle,
      }}
    >
      {children}
    </ColorContext.Provider>
  )
}
export default ColorContextProvider
