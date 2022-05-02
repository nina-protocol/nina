import React, {useContext, useEffect} from 'react'
import nina from '@nina-protocol/nina-sdk'

const { HubContext } = nina.contexts

const Hubs = () => {
  const { getHubs } = useContext(HubContext)

  useEffect(() => {
    getHubs()
  }, [])

  return (
    <span>Hubs</span>
  )
}

export default Hubs