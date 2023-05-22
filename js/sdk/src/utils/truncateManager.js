export const truncateAddress = (address) => {
  return `${address.slice(0, 4)}...${address.slice(
    address.length - 4,
    address.length
  )}`
}

export const truncateString = (string) => {
  return `${string.slice(0, 20)}...`
}
