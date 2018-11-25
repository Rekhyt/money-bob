const io = require('socket.io')()
const uuid = require('uuid/v4')

const { CommandDispatcherLocal, EventDispatcherLocal } = require('ddd-js')
const logger = require('./util/getBunyanLogger')('money-bob')

const commandDispatcher = new CommandDispatcherLocal(logger)
const eventDispatcher = new EventDispatcherLocal(logger)

io.on('connection', socket => {
  socket.on('disconnect', () => {
    console.log('kthxbai')
  })

  socket.on('command', async command => {
    const commandId = `command-${uuid()}`
    logger.info(`Handling incoming command "${command.name}"`, {
      commandId,
      type: 'command',
      name: command.name,
      time: command.time,
      payload: JSON.stringify(command.payload)
    })

    let events
    try {
      events = commandDispatcher.dispatch(command)
      logger.info(`Command "${command.name}" handled successfully.`, { commandId })
    } catch (err) {
      logger.error(`Failed handling command "${command.name}": ${err.message}`, { commandId, error: err })
    }

    try {
      logger.info(`Publishing resulting events`)
      await eventDispatcher.publishMany(events)
    } catch (err) {

    }
  })

  socket.on('event', async event => {
    const eventId = `event-${uuid()}`
    logger.info(`Handling incoming event "${event.name}`, {
      eventId,
      type: 'event',
      name: event.name,
      time: event.time,
      payload: JSON.stringify(event.payload)
    })

    await eventDispatcher.publish(event)
  })
})
