import axios from 'axios'
const getFromArweaveWithFallback = async (uri, headers, responseType) => {
  try {
    const response = await axios.get(uri, {
      headers,
      responseType,
      mode: 'cors',
    })
    return response
  } catch (error) {
    try {
      const response = await axios.get(
        uri.replace('arweave.net', 'ar-io.net'),
        {
          headers,
          responseType,
          mode: 'cors',
        }
      )
      return response
    } catch (error) {
      console.error(error)
    }
  }
}

export default getFromArweaveWithFallback
