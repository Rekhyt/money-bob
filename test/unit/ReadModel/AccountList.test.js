const assert = require('assert')
const chai = require('chai')

chai.should()

const AccountList = require('../../../src/ReadModel/AccountList')

describe('AccountList', () => {
  let subjectUnderTest
  let logger
  let eventDispatcher

  beforeEach(() => {
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

  describe('event handling functions', () => {
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

      await Promise.all(events.map(async event => {
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
      }))
    })
  })

  describe('accounts', () => {
    it('should return the list of all previously added accounts', () => {
      const expectedAccounts = [
        { name: 'account-1', type: 'paypal', metadata: { email: 'bob@weird-webdesign.com' }, tags: [] },
        { name: 'account-2', type: 'paypal', metadata: { email: 'jay@weird-webdesign.com' }, tags: [] },
        { name: 'account-3', type: 'paypal', metadata: { email: 'brodie@weird-webdesign.com' }, tags: [] }
      ]

      subjectUnderTest._accounts = expectedAccounts

      assert.deepStrictEqual(subjectUnderTest.accounts, expectedAccounts)
    })
  })

  describe('accountCreated', () => {
    it('should add an account to the list of already existing accounts', async () => {
      const expectedAccounts = [
        { name: 'account-1', type: 'paypal', metadata: { email: 'bob@weird-webdesign.com' }, tags: [], parent: null },
        { name: 'account-2', type: 'paypal', metadata: { email: 'jay@weird-webdesign.com' }, tags: [], parent: null },
        { name: 'account-3', type: 'paypal', metadata: { email: 'brodie@weird-webdesign.com' }, tags: [], parent: null }
      ]

      subjectUnderTest._accounts = [expectedAccounts[0], expectedAccounts[1]]
      await subjectUnderTest.accountCreated(
        expectedAccounts[2].name,
        expectedAccounts[2].type,
        expectedAccounts[2].metadata,
        expectedAccounts[2].parent
      )

      assert.deepStrictEqual(subjectUnderTest.accounts, expectedAccounts)
    })
  })

  describe('accountsLinked', () => {
    it('should should set the parent account as the sub account\'s parent', async () => {
      const expectedParent = 'account-2'

      subjectUnderTest._accounts = [
        { name: 'account-1' },
        { name: expectedParent }
      ]

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.accountsLinked('account-1', 'account-2')

      assert.strictEqual(subjectUnderTest._accounts[0].parent, 'account-2')
    })
  })

  describe('tagsAdded', () => {
    it('should should add the tags to the proper account', async () => {
      const expectedAccount = { name: 'account-1', type: 'paypal', metadata: {}, tags: [], parent: null }
      const expectedTags = ['car', 'repair', 'service']
      subjectUnderTest._accounts = [expectedAccount]

      await subjectUnderTest.tagsAdded('account-1', expectedTags)

      assert.deepStrictEqual(expectedAccount.tags, expectedTags)
    })
  })
})
