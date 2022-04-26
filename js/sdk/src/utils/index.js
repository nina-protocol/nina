import * as encrypt from './encrypt'
import * as web3 from './web3'

const dateConverter = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000)
  var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()
  var hour = a.getHours().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var min = a.getMinutes().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var sec = a.getSeconds().toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })
  var time =
    year + ' ' + month + '/' + date + ' ' + hour + ':' + min + ':' + sec
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

  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return minutes + ':' + seconds
}

export {
  arrayMove,
  dateConverter,
  formatDuration,
  formatPlaceholder,
  encrypt,
  web3,
}
