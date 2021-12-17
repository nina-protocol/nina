// components/layout.js

import NavDrawer from './NavDrawer'

const Layout = ({children}) => {
  return (
    <>
      <NavDrawer />
      <main>{children}</main>
    </>
  )
}

export default Layout;