// const MetricfyAgent = require('metricfy-agent')
const MetricfyAgent = require('../')
const chalk = require('chalk')

const agent = new MetricfyAgent({
  name: `myapp-${Math.random()}`,
  username: `user-${Math.random()}`,
  interval: 1400
})

agent.addMetric('rss', function getRss () {
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise () {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})

agent.connect()

// This agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Other Agents
agent.on('agent/connected', handlerCon)
agent.on('agent/disconnected', handlerDis)
agent.on('agent/message', handlerMsg)

function handler (payload) {
  console.log(payload)
}

function handlerCon (payload) {
  console.log(`${chalk.green('AGENT/CONNECTED')}`)
  console.log(payload)
}

function handlerDis (payload) {
  console.log(`${chalk.red('AGENT/DISCONNECTED')}`)
  console.log(payload)
}

function handlerMsg (payload) {
  console.log(`${chalk.blue('AGENT/MESSAGE')}`)
  console.log(payload)
}

// setTimeout(() => agent.disconnect(), 20000)
