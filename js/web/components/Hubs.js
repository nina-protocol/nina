import React, {useContext, useEffect} from 'react'
import nina from '@nina-protocol/nina-sdk'

const { HubContext } = nina.contexts

const Hubs = () => {
  const { getHubs, hubState } = useContext(HubContext)

  useEffect(() => {
    getHubs()
  }, [])
  
  useEffect(() => {
    console.log(hubState)
  }, [hubState])

  return (
    <span>Hubs</span>
  )
}

export default Hubs