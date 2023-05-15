export const truncateAddress = (address) => {
  return `${address.slice(0, 4)}...${address.slice(
    address.length - 4,
    address.length
  )}`
}

export const truncateStringToLength = (string, index) => {
  return `${string.substring(0, index)}...`
}

export const truncateForUi = (string, index, stringLength, maxLength) => {
  if (
    (string.length > stringLength && string.indexOf(' ') === -1) ||
    string.length > maxLength
  ) {
    return truncateStringToLength(string, index)
  } else {
    return string
  }
}
