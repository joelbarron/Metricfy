'use strict'

const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const chalk = require('chalk')
const { handleFatalError, errorHandlerExpress } = require('metricfy-utils')
const { configApi } = require('metricfy-config')

const apiv1 = require('./api-v1')

// const app = express()
const app = asyncify(express()) // solucion al async await para express, ya que nativamente no lo soporta
const server = http.createServer(app)

// rutas de la api
app.use('/v1', apiv1)

// Express error handled
app.use(errorHandlerExpress)

if (!module.parent) {
  // lanzar el servidor
  process.on('uncaughtExeption', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(configApi.port, () => {
    console.log(`${chalk.green('[metricfy-api]')} server listening on port ${configApi.port}`)
  })
}

// exportar el server
module.exports = server
