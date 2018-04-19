'use strict'

/**
 * Class represeting a custom error object
 */
class CustomError extends Error {
  /**
   * Create a error for token module
   * @param {Object} ...restparam - template to create the error
   */
  constructor ({
    message,
    name,
    status,
    field
  } = {}) {
    // Get the properties of the error according with the name
    super()

    // Set the new properties
    this.message = message
    this.name = name
    this.status = status
    this.field = field
  }
}

// Templates to create the errors
const templates = new Map([
  ['AgentNotFound', {
    name: 'AgentNotFound',
    message: 'Agent not found',
    status: 404
  }],
  ['MetricsNotFound', {
    name: 'MetricstNotFound',
    message: 'Metrics not found for Agent',
    status: 404
  }],
  ['Unauthorized', {
    name: 'Unauthorized',
    message: 'Access Unauthorized',
    status: 401
  }]
])

/**
 * @param {String} name - Name of the error in the templates map.
 * @returns {Error} custom error object according with the error name.
 */
const errorFactory = name => new CustomError(templates.get(name))

module.exports = errorFactory
