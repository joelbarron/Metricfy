'use strict'
/*
  ESTE ARCHIVO ES EL INDEX DEL MODULO DE BD
  EN EL CUAL SE UTILIZA SINGLETON PARA NO REPLICAR INSTANCIAS
  SE CONFIGURAN LAS INSTANCIAS DE BASE DE DATOS ASI COMO LOS MODELOS DE LA MISMA
  SE LE PUEDE PASAR UNA CONFIGURACION Y EN CASO DE OMITIRLA SE ASIGNA UNA POR DEFAULT
*/

const setupDatabase = require('./lib/db')
const setupAgentmodel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const defaults = require('defaults')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  // obtener las instancias
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentmodel(config)
  const MetricModel = setupMetricModel(config)

  // definir relaciones
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  // verificar que este conectada
  await sequelize.authenticate()

  // si la variable setup esta en true borrar la bd y crearla nuevamente
  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
