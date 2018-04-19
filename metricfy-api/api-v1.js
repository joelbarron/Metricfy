'use strict'

const debug = require('debug')('metricfy:api:routes')
const express = require('express')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()
const asyncify = require('express-asyncify')
const errors = require('./errors')
const db = require('metricfy-db')
const { dbConfig, authConfig } = require('metricfy-config')

// traer la configuracion
let config = {}
config.db = dbConfig({setup: false}) // no hacer el setup (ya que si no se borra la db)
config.auth = authConfig

// const api = express.Router()
const api = asyncify(express.Router()) // solucion al async await para express, ya que nativamente no lo soporta

let services, Agent, Metric

// middleware para la instancia a la db
// nota la instancia se hace una vez y despues solo se toma el objeto asignado
api.use('*', async (req, res, next) => {
  if (!services) {
    try {
      // console.log(config.db)
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }

    // asignar los servicios
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', auth(config.auth), async (req, res, next) => {
  debug('A request has come to /agents')

  const { user } = req
  let agents = []

  if (!user || !user.username) {
    return next(new Error('Not authorized'))
  }

  try {
    if (user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (e) {
    return next(e)
  }

  res.send(agents)
})

api.get('/agents/:uuid', auth(config.auth), async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /agent/${uuid}`)

  let agent

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!agent) {
    // return next(new Error('Agent not found')) manera sin custom errors
    return next(errors('AgentNotFound')) // custom errors
  }

  res.send(agent)
})

api.get('/metrics/:uuid', auth(config.auth), guard.check([ 'metrics:read' ]), async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /metrics/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(errors('MetricsNotFound'))
  }

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', auth(config.auth), async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`request to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(errors('MetricsNotFound'))
  }

  res.send(metrics)
})

module.exports = api
