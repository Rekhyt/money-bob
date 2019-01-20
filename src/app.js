const express = require('express')
const bodyParser = require('body-parser')

const { CommandDispatcherLocal, EventDispatcherLocal } = require('ddd-js')

const logger = require('./util/getBunyanLogger')('money-bob')
const EntityFactory = require('./Aggregates/EntityFactory')
const ReadModelFactory = require('./ReadModelFactory')

const eventDispatcher = new EventDispatcherLocal(logger)
const commandDispatcher = new CommandDispatcherLocal(eventDispatcher, logger)

const entityFactory = new EntityFactory(logger, commandDispatcher)
const readModelFactory = new ReadModelFactory(logger, eventDispatcher)

const account = entityFactory.createAccount()
const accountsReadModel = readModelFactory.createAccounts()

const app = express()
app.use(bodyParser.json('application/json'))

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
