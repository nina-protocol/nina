import * as encrypt from './encrypt'
import * as web3 from './web3'
import * as imageManager from './imageManager'
import * as truncateManager from './truncateManager'
import * as swap from './swap'
import CryptoJS from 'crypto-js'
import promiseRetry from 'promise-retry'
import * as downloadManager from './downloadManager'

const dateConverter = (date) => {
  var a = new Date(typeof date === 'object' ? date.toNumber() * 1000 : date)
  var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var day = a.getDate()
  var hour = a.getHours().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var min = a.getMinutes().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var sec = a.getSeconds().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var time = year + ' ' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec
  return time
}

const arrayMove = (arr, old_index, new_index) => {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
}

const formatPlaceholder = (placeholder) => {
  return placeholder
    .match(/([A-Z0-9]?[^A-Z0-9]*)/g)
    .slice(0, -1)
    .join(' ')
    .toUpperCase()
}

const formatDuration = (duration) => {
  let sec_num = parseInt(duration, 10)
  let hours = Math.floor(sec_num / 3600)
  let minutes = Math.floor((sec_num - hours * 3600) / 60)
  let seconds = sec_num - hours * 3600 - minutes * 60

  if (hours > 0) {
    minutes += hours * 60
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return minutes + ':' + seconds
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

const readChunked = (file, chunkCallback, endCallback) => {
  const chunkSize = 1024 * 1024 * 10 // 10MB
  const fileSize = file.size
  let offset = 0

  let reader = new FileReader()
  reader.onload = () => {
    if (reader.error) {
      console.warn(reader.error)
      endCallback(reader.error || {})
      return
    }
    offset += reader.result.length
    chunkCallback(reader.result, offset, fileSize)
    if (offset >= fileSize) {
      endCallback()
      return
    }
    readNext()
  }

  reader.onerror = (err) => {
    console.warn(err)
    endCallback(err || {})
  }

  const readNext = () => {
    const slice = file.slice(offset, offset + chunkSize)
    reader.readAsBinaryString(slice)
  }
  readNext()
}

const getMd5FileHash = async (file, progress) => {
  return new Promise((resolve, reject) => {
    let md5 = CryptoJS.algo.MD5.create()
    readChunked(
      file,
      (chunk, offset, total) => {
        md5 = md5.update(CryptoJS.enc.Latin1.parse(chunk))
        if (progress) {
          progress(offset / total)
        }
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          const hash = md5.finalize()
          resolve(hash.toString())
        }
      }
    )
  })
}

const stripQuotesIfNeeded = (str) => {
  return str.replace(/^"(.*)"$/, '$1')
}

const parseChecker = (data) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    return data
  }
}

const getConfirmTransaction = async (txid, connection) => {
  const res = await promiseRetry(
    async (retry) => {
      let txResult = await connection.getTransaction(txid, {
        commitment: 'confirmed',
      })

      if (!txResult) {
        const error = new Error('unable_to_confirm_transaction')
        error.txid = txid

        retry(error)
        return
      }
      return txResult
    },
    {
      retries: 5,
      minTimeout: 500,
      maxTimeout: 1000,
    }
  )
  if (res.meta.err) {
    throw new Error('Transaction failed')
  }
  return txid
}

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' year' : ' years')
  }
  interval = seconds / 2592000
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' month' : ' months')
  }
  interval = seconds / 86400
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' day' : ' days')
  }
  interval = seconds / 3600
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' hour' : ' hours')
  }
  interval = seconds / 60
  if (interval > 1) {
    const roundedInterval = Math.floor(interval)
    return roundedInterval + (roundedInterval === 1 ? ' minute' : ' minutes')
  }
  return Math.floor(seconds) + ' seconds'
}

export {
  arrayMove,
  dateConverter,
  formatDuration,
  formatPlaceholder,
  getConfirmTransaction,
  imageManager,
  downloadManager,
  truncateManager,
  swap,
  sleep,
  encrypt,
  web3,
  shuffle,
  getMd5FileHash,
  stripQuotesIfNeeded,
  parseChecker,
  timeSince,
}
