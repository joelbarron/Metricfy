'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const auth = require('../auth')
const util = require('util')
const { authConfig } = require('metricfy-config')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let server = null
let sandbox = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

const uuid = 'yyy-yyy-yyy'
const wrongUuid = 'xxx-yyy-yyy'
const type = 'Memory'

const sign = util.promisify(auth.sign)
let token = null
let fakeToken = 'fakeToken'

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  token = await sign({ admin: true, username: 'joelbarron' }, authConfig.secret)

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findByAgentUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)))
  MetricStub.findByTypeAgentUuid.withArgs(type, wrongUuid).returns(Promise.resolve(null))

  const apiv1 = proxyquire('../api-v1', {
    'metricfy-db': dbStub
  })

  server = proxyquire('../server', {
    './api-v1': apiv1
  })
})

test.afterEach(async () => {
  sandbox && sinon.sandbox.restore()
})

test.serial.cb('/v1/agents', t => {
  request(server)
    .get('/v1/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')

      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.connected)

      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('testing /v1/agents/:uuid', t => {
  request(server)
      .get(`/v1/agents/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(agentFixtures.byUuid(uuid))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /v1/agents/:uuid - not found', t => {
  request(server)
      .get(`/v1/agents/${wrongUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.name, 'should return an error')
        t.regex(res.body.message, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /v1/metrics/:uuid', t => {
  request(server)
      .get(`/v1/metrics/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(metricFixtures.findByAgentUuid(uuid))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /v1/metrics/:uuid - not found', t => {
  request(server)
      .get(`/v1/metrics/${wrongUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.name, 'should return an error')
        t.regex(res.body.message, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /v1/metrics/:uuid/:type', t => {
  request(server)
      .get(`/v1/metrics/${uuid}/${type}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(metricFixtures.findByTypeAgentUuid(type, uuid))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /v1/metrics/:uuid/:type - not found', t => {
  request(server)
      .get(`/v1/metrics/${wrongUuid}/${type}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.name, 'should return an error')
        t.regex(res.body.message, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('/api/metrics/:uuid/:type - false token', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${fakeToken}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      t.end()
    })
})
