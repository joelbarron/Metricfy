'use strict'

const chalk = require('chalk')
const debug = require('debug')('metricfy:web')
const http = require('http')
const path = require('path')
const express = require('express')
const asyncify = require('express-asyncify')
const socketio = require('socket.io')
const MetricfyAgent = require('metricfy-agent')
const proxy = require('./proxy')
const { configWeb } = require('metricfy-config')
const { handleFatalError, errorHandlerExpress, pipe } = require('metricfy-utils')

const app = asyncify(express())
const server = http.createServer(app)
const io = socketio(server)
const agent = new MetricfyAgent({
  mqtt: {
    host: configWeb.mqttHost
  }
})

// montar archivos estatico
app.use(express.static(path.join(__dirname, 'public')))

// rutas de la api
app.use('/', proxy)

// Express error handled
app.use(errorHandlerExpress)

// socket.io - websockets
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  // los mensajes que se reciban al agente mqtt se van a redirigir al portal web con socket io
  pipe(agent, socket)
})

// lanzar el servidor
process.on('uncaughtExeption', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(configWeb.port, () => {
  console.log(`${chalk.green('[metricfy-api]')} server listening on port ${configWeb.port}`)
  agent.connect() // conectar el agente
})
