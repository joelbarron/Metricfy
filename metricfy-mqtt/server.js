'use strict'

const debug = require('debug')('metricfy:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('metricfy-db')
const { dbConfig } = require('metricfy-config')
const { parsePayload, handleFatalError, handleError } = require('metricfy-utils')

// traer la configuracion
const configDatabase = dbConfig({setup: false}) // no hacer el setup (ya que si no se borra la db)

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const server = new mosca.Server(settings)

// servicio de agente y metricas
let Agent, Metric
let clients = new Map()

// CLIENTE CONECTADO
server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

// CLIENTE DESCONECTADO
server.on('clientDisconnected', async client => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    // marcar como desconectado
    agent.connected = false

    try {
      // actualizarlo en la DB
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }

    // borrar de la lista de clientes
    clients.delete(client.id)

    // hacer un broadcast a todos
    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

// MENSAJE PUBLICADO EN EL SERVER
server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`) // tipo del mensaje (ej: agent conected, disconected, message)

  switch (packet.topic) {
    case 'agent/connected':
      debug(`Payload: ${packet.payload}`) // informacion
      break
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`) // informacion
      break
    case 'agent/message':

      debug(`Payload: ${packet.payload}`) // informacion
      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true // consideraciones si le mandan cualquier json diferente crasheara por que no podra asignarle al connected true

        let agent

        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }
        debug(`Agent ${agent.uuid} saved`) // agente guardado

        // notificar que el agente fue conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)

          // broadcast a todos
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // almacenar las metricas (el for of soporta async await es la unica diferencia con respecto al for each)
        for (let metric of payload.metrics) {
          let m
          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (e) {
            return handleError(e)
          }

          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
})

// CORRER EL SERVER
server.on('ready', async () => {
  // instanciar la db
  const services = await db(configDatabase).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[metricfy-mqtt]')} server is running`)
})

// ERROR EN EL SERVER
server.on('error', handleFatalError)

// execpion no manejada
process.on('uncaughtException', handleFatalError)

// rejecciones de promesas
process.on('unhandledRejection', handleFatalError)
