const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const {
  CommandDispatcherLocal,
  // EventDispatcherLocal,
  EventDispatcherEventEmitter,
  EventRepositoryJsonFile,
  InvalidArgumentError,
  InvalidTypeError,
  SagaError,
  ValidationError
} = require('ddd-js')

const logger = require('./util/getBunyanLogger')('money-bob')
const EntityFactory = require('./Aggregates/EntityFactory')
const ReadModelFactory = require('./ReadModelFactory')
const SagaFactory = require('./SagaFactory')

const eventRepository = new EventRepositoryJsonFile(path.join(__dirname, '..', 'datasources', 'events.json'))
const eventDispatcher = new EventDispatcherEventEmitter(logger, eventRepository)
// const eventDispatcher = new EventDispatcherLocal(logger, eventRepository)
const commandDispatcher = new CommandDispatcherLocal(eventDispatcher, logger)

const entityFactory = new EntityFactory(logger, commandDispatcher, eventDispatcher)
const readModelFactory = new ReadModelFactory(logger, eventDispatcher)

const accountList = entityFactory.createAccountList()
const accountListReadModel = readModelFactory.createAccountList()
const accountTreeReadModel = readModelFactory.createAccountTree()

const app = express()
app.use(bodyParser.json('application/json'))

eventDispatcher.replayAll().then(() => {
  app.post('/command', async (req, res) => {
    try {
      await commandDispatcher.dispatch(req.body)

      res.status(202).end()
    } catch (err) {
      let logSubject = err
      let status = 500
      let errorResponse = { message: err.message }

      if (err instanceof InvalidArgumentError || err instanceof InvalidTypeError) {
        logSubject = err.message
        status = 400
      }

      if (err instanceof ValidationError) {
        logSubject = { message: err.message, invalidFields: err.invalidFields }
        errorResponse.invalidFields = err.invalidFields
      }

      logger.error(logSubject)
      res.status(status)
      res.json(errorResponse)
    }
  })

  app.get('/accounts', (req, res) => {
    res.json(accountListReadModel.accounts)
  })

  app.get('/accountTree', (req, res) => {
    res.json(accountTreeReadModel.accounts)
  })

  app.listen(8000)
})

process.on('SIGINT', () => {
  eventRepository.stopSaving()
  eventRepository.saveFile()
  process.exit(0)
})
