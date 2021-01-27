const assert = require('assert')
const chai = require('chai')

chai.should()

const AccountTree = require('../../../src/ReadModel/AccountTree')

describe('ReadModel.AccountTree', () => {
  let subjectUnderTest
  let logger
  let eventDispatcher

  beforeEach(() => {
    // noinspection JSUnusedGlobalSymbols
    logger = {
      trace: (...args) => {
      },
      debug: (...args) => {
      },
      info: (...args) => {
      },
      warn: (...args) => console.log(args),
      error: (...args) => console.log(args)
    }

    // noinspection JSUnusedGlobalSymbols
    eventDispatcher = {
      subscribe: () => {
      }
    }
    subjectUnderTest = new AccountTree(logger, eventDispatcher)
  })

  describe('constructor', () => {
    it('should register all event handlers', () => {
      const expectedEvents = ['Account.accountCreated', 'Account.accountsLinked', 'Account.tagsAdded']

      let subscribeCallCount = 0
      eventDispatcher.subscribe = event => {
        assert.deepStrictEqual(event, expectedEvents[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountTree(logger, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountTree)

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
        { name: 'account-1', tags: [], children: [] },
        { name: 'account-2', tags: [], children: [] },
        { name: 'account-3', tags: [], children: [] }
      ]

      subjectUnderTest._accountTree = expectedAccounts

      assert.deepStrictEqual(subjectUnderTest.accounts, expectedAccounts)
    })
  })

  describe('accountCreated', () => {
    it('should add an account to the list of already existing accounts', async () => {
      const expectedAccounts = [
        { name: 'account-1', tags: [], children: [] },
        { name: 'account-2', tags: [], children: [] },
        { name: 'account-3', tags: [], children: [] }
      ]

      subjectUnderTest._accountTree = [expectedAccounts[0], expectedAccounts[1]]
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
    it('should reflect in the tree representation when two accounts are linked', async () => {
      const expectedAccounts = [
        {
          name: 'mobility',
          tags: ['car', 'scooter'],
          children: [
            {
              name: 'car',
              tags: ['car'],
              children: [
                { name: 'car dealer', tags: ['car', 'service', 'repair'], children: [], parent: 'car' },
                { name: 'gas station', tags: ['car', 'fuel'], children: [], parent: 'car' },
                { name: 'car parts online shop', tags: ['car', 'repair'], children: [], parent: 'car' },
                { name: 'car parking garage', tags: ['car', 'parking'], children: [], parent: 'car' },
                { name: 'car parking tickets', tags: ['car', 'parking'], children: [], parent: 'car' }
              ],
              parent: 'mobility'
            },
            {
              name: 'scooter',
              tags: ['scooter'],
              children: [
                { name: 'scooter insurance', tags: ['scooter', 'insurance'], children: [], parent: 'scooter' }
              ],
              parent: 'mobility'
            }
          ],
          parent: null
        }
      ]

      subjectUnderTest = new AccountTree(logger, eventDispatcher, [
        JSON.parse(JSON.stringify(expectedAccounts[0].children[1].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[3])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[1])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[4])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[2])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[1])),
        JSON.parse(JSON.stringify(expectedAccounts[0]))
      ].map(account => {
        account.children = []
        account.parent = null
        return account
      }))

      await Promise.all([
        subjectUnderTest.accountsLinked('car', 'mobility'),
        subjectUnderTest.accountsLinked('scooter', 'mobility'),
        subjectUnderTest.accountsLinked('car dealer', 'car'),
        subjectUnderTest.accountsLinked('gas station', 'car'),
        subjectUnderTest.accountsLinked('car parts online shop', 'car'),
        subjectUnderTest.accountsLinked('car parking garage', 'car'),
        subjectUnderTest.accountsLinked('car parking tickets', 'car'),
        subjectUnderTest.accountsLinked('scooter insurance', 'scooter')
      ])

      assert.deepStrictEqual(subjectUnderTest.accounts, expectedAccounts)
    })
  })

  describe('tagsAdded', () => {
    it('should add tags to the proper account', async () => {
      const expectedAccounts = [
        {
          name: 'mobility',
          tags: ['car', 'scooter'],
          children: [
            {
              name: 'car',
              tags: ['car'],
              children: [
                { name: 'car dealer', tags: ['car', 'service', 'repair'], children: [], parent: 'car' },
                { name: 'gas station', tags: ['car', 'fuel'], children: [], parent: 'car' },
                { name: 'car parts online shop', tags: ['car', 'repair'], children: [], parent: 'car' },
                { name: 'car parking garage', tags: ['car', 'parking'], children: [], parent: 'car' },
                { name: 'car parking tickets', tags: ['car', 'parking'], children: [], parent: 'car' }
              ],
              parent: 'mobility'
            },
            {
              name: 'scooter',
              tags: ['scooter'],
              children: [
                { name: 'scooter insurance', tags: ['scooter', 'insurance'], children: [], parent: 'scooter' }
              ],
              parent: 'mobility'
            }
          ],
          parent: null
        }
      ]

      subjectUnderTest = new AccountTree(logger, eventDispatcher, [
        JSON.parse(JSON.stringify(expectedAccounts[0].children[1].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[3])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[1])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[4])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[2])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[0])),
        JSON.parse(JSON.stringify(expectedAccounts[0].children[1])),
        JSON.parse(JSON.stringify(expectedAccounts[0]))
      ])

      expectedAccounts[0].children[1].children[0].tags.push('other')

      await subjectUnderTest.tagsAdded('scooter insurance', ['scooter', 'other', 'insurance'])

      assert.deepStrictEqual(subjectUnderTest.accounts, expectedAccounts)
    })
  })
})
