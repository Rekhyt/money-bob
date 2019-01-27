const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const { CommandDispatcherLocal, EventDispatcherLocal, EventDispatcherEventEmitter, EventRepositoryJsonFile } = require('ddd-js')

const logger = require('./util/getBunyanLogger')('money-bob')
const EntityFactory = require('./Aggregates/EntityFactory')
const ReadModelFactory = require('./ReadModelFactory')

const eventRepository = new EventRepositoryJsonFile(path.join(__dirname, '..', 'datasources', 'events.json'))
const eventDispatcher = new EventDispatcherEventEmitter(logger, eventRepository)
// const eventDispatcher = new EventDispatcherLocal(logger, eventRepository)
const commandDispatcher = new CommandDispatcherLocal(eventDispatcher, logger)

const entityFactory = new EntityFactory(logger, commandDispatcher, eventDispatcher)
const readModelFactory = new ReadModelFactory(logger, eventDispatcher)

const account = entityFactory.createAccount()
const accountsReadModel = readModelFactory.createAccounts()

const app = express()
app.use(bodyParser.json('application/json'))

eventDispatcher.replayAll().then(() => {
  app.post('/command', async (req, res) => {
    try {
      await commandDispatcher.dispatch(req.body)

      res.status(202).end()
    } catch (err) {
      logger.error(err)
      res.status(400)
      res.json({ message: err.message })
    }
  })

  app.get('/accounts', (req, res) => {
    res.json(accountsReadModel.accounts)
  })

  app.listen(8000)
})

process.on('SIGINT', () => {
  eventRepository.stopSaving()
  eventRepository.saveFile()
  process.exit(0)
})
