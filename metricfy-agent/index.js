'use strict'

const EvenEmitter = require('events')
const debug = require('debug')('metricfy:agent')
const os = require('os')
const util = require('util')
const mqtt = require('mqtt')
const defaults = require('defaults')
const uuid = require('uuid')
const { parsePayload } = require('metricfy-utils')

const defOptions = {
  name: 'untiled',
  username: 'no-user',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class MetricfyAgent extends EvenEmitter {
  constructor (opts) {
    super()

    this._options = defaults(opts, defOptions)
    this._timer = null // para el intervalo de envio de metricas
    this._started = false // para verfificar el status
    this._client = null // es el cliente mqtt
    this._agentId = null // id de nuestro agente
    this._metrics = new Map() // metricas que reportara
  }

  connect () {
    if (!this._started) {
      // asignar las opciones
      const opts = this._options

      // conectarnos al server
      this._client = mqtt.connect(opts.mqtt.host)

      // marcar como inicializado
      this._started = true

      // suscripciones
      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      // si se conecta
      this._client.on('connect', () => {
        // generar el uuid
        this._agentId = uuid.v4()

        this.emit('connected', this._agentId) // emit

        // inicializar el timer
        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            let message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              },
              metrics: [],
              timestamp: new Date().getTime()
            }

            for (let [ metric, fn ] of this._metrics) {
              if (fn.length === 1) {
                fn = util.promisify(fn) // convertir el callback a la promesa
              }

              message.metrics.push({
                type: metric,
                value: await Promise.resolve(fn())
              })
            }

            debug('Sending', message)

            this._client.publish('agent/message', JSON.stringify(message))

            this.emit('message', message)
          }
        }, opts.interval)
      })

      // si recibimos un mensaje
      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        let broadcast = false

        switch (topic) {
          case 'agent/connected':
            break
          case 'agent/disconnected':
            break
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      // si ocurre un error nos desconectamos
      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }

  addMetric (type, fn) {
    this._metrics.set(type, fn)
  }

  removeMetric (type, fn) {
    this._metrics.delete(type)
  }
}

module.exports = MetricfyAgent
