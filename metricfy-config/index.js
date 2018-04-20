'use strict'

/*
  SIRVE PARA RETORNAR LA CONFIGURACION
*/

const debug = require('debug')('metricfy:db')
const { extend } = require('metricfy-utils')

function dbConfig (configExtra) {
  // objeto de configuracion
  const configDatabase = {
    database: process.env.DB_NAME || 'metricfydb',
    username: process.env.DB_USER || 'metricfy',
    password: process.env.DB_PASS || 'pass123',
    hostname: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    loggin: s => debug(s),
    setup: false
  }

  if (configExtra) { return extend(configDatabase, configExtra) }

  return configDatabase
}

const authConfig = {
  secret: process.env.SECRET || 'metricfy'
}

const configApi = {
  port: process.env.PORT || 3000
}

const configWeb = {
  port: process.env.PORT || 8080,
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
  apiVersion: process.env.API_VERSIOIN || 'v1',
  apiToken: process.env.API_TOKEN || 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvZWxiYXJyb24iLCJhZG1pbiI6dHJ1ZSwicGVybWlzc2lvbnMiOlsibWV0cmljczpyZWFkIl0sImlhdCI6MTUxNjIzOTAyMn0.KRCrFXnOtfPtzLDWtfMsiBZ8Nksx1PBkA9LM0cAmMr8xeD59IiiyhV-vXReeBNDLUgT4M6gnPDronHgXWy6_KA'
}

module.exports = {
  dbConfig,
  authConfig,
  configApi,
  configWeb
}
