const assert = require('assert')
const chai = require('chai')

chai.should()

const AccountList = require('../../../src/ReadModel/AccountList')

describe('AccountList', () => {
  let defaultAccountList
  let subjectUnderTest
  let logger
  let eventDispatcher

  beforeEach(() => {
    defaultAccountList = (num) => {
      const accounts = []
      let parentName = null
      for (let i = 1; i <= num; i++) {
        const parent = { name: `account-${i}`, parent: parentName }
        parentName = parent.name
        accounts.push(parent)
      }

      return accounts
    }

    // noinspection JSUnusedGlobalSymbols
    logger = {
      trace: (...args) => {},
      debug: (...args) => {},
      info: (...args) => {},
      warn: (...args) => console.log(args),
      error: (...args) => console.log(args)
    }

    // noinspection JSUnusedGlobalSymbols
    eventDispatcher = {
      subscribe: () => {}
    }
    subjectUnderTest = new AccountList(logger, eventDispatcher)
  })

  describe('constructor', () => {
    it('should register all event handlers', () => {
      const expectedEvents = ['Account.accountCreated', 'Account.accountsLinked', 'Account.tagsAdded']

      let subscribeCallCount = 0
      eventDispatcher.subscribe = event => {
        assert.deepStrictEqual(event, expectedEvents[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountList(logger, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountList)

      assert.strictEqual(subscribeCallCount, expectedEvents.length)
    })
  })

  describe('command & event handling functions', () => {
    it('should spread the event payloads and pass them to the proper class methods', async () => {
      const events = [
        {
          name: 'Account.accountCreated',
          payload: {
            name: 'account-1',
            type: 'bankaccount',
            metadata: { iban: '345678962298' }
          }
        },
        {
          name: 'Account.accountsLinked',
          payload: {
            subAccountName: 'account-2',
            parentAccountName: 'account-1'
          }
        },
        {
          name: 'Account.tagsAdded',
          payload: {
            name: 'account-1',
            tags: ['car', 'service', 'repair']
          }
        }
      ]

      events.forEach(async event => {
        let called = false
        subjectUnderTest[event.name.split('.')[1]] = (...args) => {
          called = true
          const payloadValues = Object.values(event.payload)
          args.forEach((arg, index) => {
            assert.deepStrictEqual(arg, payloadValues[index])
          })
        }

        await subjectUnderTest.apply({
          name: event.name,
          time: new Date().toISOString(),
          payload: event.payload
        })

        assert.ok(called, `Handler for event "${event.name}" was not called.`)
      })
    })
  })
})