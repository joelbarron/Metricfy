'use strict'

const express = require('express')
const request = require('request-promise-native')
const asyncify = require('express-asyncify')
const { configWeb } = require('metricfy-config')

const api = asyncify(express.Router())

api.get('/agents', async(req, res, next) => {
  const options = {
    method: 'GET',
    url: `${configWeb.apiEndpoint}/${configWeb.apiVersion}/agents`,
    headers: {
      'Authorization': `Bearer ${configWeb.apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }

  res.send(result)
})

api.get('/agents/:uuid', async(req, res) => {
  const options = {
    method: 'GET',
    url: `${configWeb.apiEndpoint}/${configWeb.apiVersion}/agents/${req.params.uuid}`,
    headers: {
      'Authorization': `Bearer ${configWeb.apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }

  res.send(result)
})

api.get('/metrics/:uuid', async(req, res) => {
  const options = {
    method: 'GET',
    url: `${configWeb.apiEndpoint}/${configWeb.apiVersion}/metrics/${req.params.uuid}`,
    headers: {
      'Authorization': `Bearer ${configWeb.apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }

  res.send(result)
})

api.get('/metrics/:uuid/:type', async(req, res) => {
  const options = {
    method: 'GET',
    url: `${configWeb.apiEndpoint}/${configWeb.apiVersion}/metrics/${req.params.uuid}/${req.params.type}`,
    headers: {
      'Authorization': `Bearer ${configWeb.apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(e)
  }

  res.send(result)
})

module.exports = api
