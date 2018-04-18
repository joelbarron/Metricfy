'use strict'

module.exports = function setupAgent (AgentModel) {
  // FUNCION QUE CREA O ACTUALIZA UN AGENTE
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existinAgent = await AgentModel.findOne(cond)

    if (existinAgent) {
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existinAgent
    }

    const result = await AgentModel.create(agent)
    return result.toJSON()
  }

  // FUNCION PARA FILTRAR POR ID
  function findById (id) {
    return AgentModel.findById(id)
  }

  // FUNCION PARA FILTRAR POR UUID
  function findByUuid (uuid) {
    return AgentModel.findOne({
      where: {
        uuid
      }
    })
  }

  // FUNCION PARA MOSTRAR TODOS LOS AGENTES
  function findAll () {
    return AgentModel.findAll()
  }

  // FILTRAR AGENTES CONECTADOS
  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }

  // FILTRAR AGENTES POR USERNAME
  function findByUsername (username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true
      }
    })
  }

  return {
    createOrUpdate,
    findById,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}
