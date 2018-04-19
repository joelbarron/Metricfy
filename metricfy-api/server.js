'use strict'

const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const chalk = require('chalk')
const debug = require('debug')('metricfy:api')
const { handleFatalError } = require('metricfy-utils')

const apiv1 = require('./api-v1')

const port = process.env.PORT || 3000

// const app = express()
const app = asyncify(express()) // solucion al async await para express, ya que nativamente no lo soporta
const server = http.createServer(app)

// rutas de la api
app.use('/v1', apiv1)

// Express error handled
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  // Response with the error if has a status property
  if (err.status) {
    return res.status(err.status).send(err)
  }

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

if (!module.parent) {
  // lanzar el servidor
  process.on('uncaughtExeption', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[metricfy-api]')} server listening on port ${port}`)
  })
}

// exportar el server
module.exports = server
