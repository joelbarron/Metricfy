'use strict'

/**
  EN ESTE ARCHIVO SE RETORNA LA INSTANCIA DE SEQUELIZE
  PARA NO DUPLICAR INSTANCIAS
 */

const Sequelize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (config) {
  if (!sequelize) {
    sequelize = new Sequelize(config)
  }

  return sequelize
}
