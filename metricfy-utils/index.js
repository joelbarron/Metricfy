'use strict'

const chalk = require('chalk')

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function sortBy (property) {
  return (a, b) => {
    let aProp = a[property]
    let bProp = b[property]

    if (aProp < bProp) {
      return -1
    } else if (aProp > bProp) {
      return 1
    } else {
      return 0
    }
  }
}

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
    // console.log('si pude')
  } catch (e) {
    payload = null
    // console.log('no pude')
  }

  return payload
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.log(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack)
}

module.exports = {
  extend,
  sortBy,
  parsePayload,
  handleFatalError,
  handleError
}
