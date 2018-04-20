'use strict'

const chalk = require('chalk')
const debug = require('debug')('metricfy:utils')

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

function errorHandlerExpress (err, req, res, next) {
  debug(`Error: ${err.message}`)

  // Response with the error if has a status property
  if (err.status) {
    return res.status(err.status).send({
      title: 'Error',
      message: {
        message: err
      }
    })
  }

  if (err.message.match(/not found/)) {
    return res.status(404).send({
      title: 'Error',
      message: {
        message: err.message
      }
    })
  }

  res.status(500).send({
    title: 'Error',
    message: {
      message: err.message
    }
  })
}

// En la constante emit se obtiene el método original emit ya que este sera sobreescrito en el source.
// En el source sera sobreescrito para que al momento que se invoque pueda pasarle los mismo argumentos
// tanto al método emit del target como al emit original.
// Esto por que en la clase MetricfyAgent en diversos momento se invoca a this.emit(topic, payload)
// entonces lo sobreescribimos para obtener esos argumentos y pasarlo mediante el método apply al contexto de target
// y de la constante emit y sean emitidos inmediatamente. Arguments es un objeto de javascript que recibe
// todos los argumentos de la función
function pipe (source, target) {
  if (!source.emit || !target.emit) {
    throw TypeError(`Please pass EventEmitter's as argument`)
  }

  // la funcion source.emit la almacenamos en ._emit (para no perderla)
  // al mismo tiempo la almacenamos en una constante para usarla en el scope de la funcion pipe
  const emit = source._emit = source.emit

  // sobre escribimos la funcion emit de la fuente
  source.emit = function () {
    emit.apply(source, arguments) // aplicar los argumentos al SOURCE que se le pasan a la funcion EMIT
    target.emit.apply(target, arguments) // aplicar tambien al target
    return source
  }
}

module.exports = {
  extend,
  sortBy,
  parsePayload,
  handleFatalError,
  handleError,
  errorHandlerExpress,
  pipe
}
