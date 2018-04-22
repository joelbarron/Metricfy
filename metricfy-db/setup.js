'use strict'

/**
  EN ESTE ARCHIVO SE HACE EL SETUP
  SE VALIDA LA RESPUESTA DEL USUARIO PARA EVITAR PERDIDAS DE INFORMACION
  ESTE SCRIPT ES PARA USO DESDE LA TERMINAL
 */

const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { handleFatalError } = require('metricfy-utils')
const { dbConfig } = require('metricfy-config')

const prompt = inquirer.createPromptModule()

async function setup () {
  // validar si tiene flags
  if (process.argv.pop() !== '--yes') {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])
    if (!answer.setup) {
      return console.log(`${chalk.blue('Nothing happend :)')}`)
    }
  }

  // traer la configuracion
  const configDatabase = dbConfig({setup: true}) // hacer el setup y borrar la db

  console.log(configDatabase)

  // realizar el setup
  await db(configDatabase).catch(handleFatalError)

  console.log('success')
  process.exit(0)
}

setup()
