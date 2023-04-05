export default function roundUp(number, decimal) {
  const dec = Math.pow(10, decimal)
  return Math.ceil(number * dec) / dec
}
