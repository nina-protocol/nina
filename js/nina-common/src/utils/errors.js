export const ninaErrorHandler = (error, errorString) => {
  console.warn(error)
  console.log('errrr: ', error.toString())
  let msg
  if (
    error.toString().includes('0x1') ||
    error.toString().includes('The given account is not owned by the executing program') ||
    error.toString().includes(`Cannot read property 'pubkey' of undefined`)
  ) {
    msg = 'Transaction failed: Insufficient funds.'
  } else if (error.toString().includes('Signature request denied')) {
    msg = 'Transaction cancelled.'
  } else if (error.toString().includes('Attempt to debit an account but found no record of a prior credit')) {
    msg = `Transaction failed: You don't have any SOL`
  } else if (error.msg) {
    msg = `Transaction failed: ${error.msg}`
  } else if (errorString) {
    msg = errorString
  }

  if (msg) {
    return {
      success: false,
      msg,
    }
  }

  return undefined
}
