import axios from 'axios'

export const downloadWithFallback = async (url, name) => {
  try {
    const response = await axios.get(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'blob',
    })
    if (response?.data) {
      const a = document.createElement('a')
      const url = window.URL.createObjectURL(response.data)
      a.href = url
      a.download = name
      a.click()
      return true
    }
  } catch (error) {
    try {
      const response = await axios.get(
        url.replace('arweave.net', 'ar-io.net'),
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          responseType: 'blob',
        }
      )

      if (response?.data) {
        const a = document.createElement('a')
        const url = window.URL.createObjectURL(response.data)
        a.href = url
        a.download = name
        a.click()
        return true
      }
    } catch (error) {
      return false
    }
  }
  return false
}
