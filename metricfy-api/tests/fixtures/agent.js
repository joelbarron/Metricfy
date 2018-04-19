'use strict'

const { extend } = require('metricfy-utils')

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'metricfy',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'uuyyy-xxx-www', connected: false, username: 'metricfy' }),
  extend(agent, { id: 3, uuid: 'aaa-sxd-wdw' }),
  extend(agent, { id: 4, uuid: 'yaasdedyy-xxx-www', username: 'test' })
]

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  metricfy: agents.filter(a => a.username === 'metricfy'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
