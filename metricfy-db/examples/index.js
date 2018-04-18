'use strict'

const db = require('../')
const { handleFatalError } = require('metricfy-utils')
const { dbConfig } = require('metricfy-config')

async function run () {
  // traer la configuracion
  const configDatabase = dbConfig({setup: true}) // hacer el setup y borrar la db

  const { Agent, Metric } = await db(configDatabase).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log('--Agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--Agents--')
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metrics--')
  console.log(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  console.log('--metric--')
  console.log(metric)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
  console.log('--metrics--')
  console.log(metricsByType)

  process.exit(0)
}

run()
