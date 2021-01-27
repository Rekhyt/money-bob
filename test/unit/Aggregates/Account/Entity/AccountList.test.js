const assert = require('assert')
const sinon = require('sinon')
const chai = require('chai')
chai.should()

const { ValidationError } = require('ddd-js')
const Currency = require('../../../../../src/ValueObject/Currency')
const AccountList = require('../../../../../src/Aggregates/Account/Entity/AccountList')
const Account = require('../../../../../src/Aggregates/Account/Entity/Account')
const Debit = require('../../../../../src/Aggregates/Account/Entity/Debit')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')
const DebitorName = require('../../../../../src/Aggregates/Account/ValueObject/Metadata/DebitorName')

const AccountImpl = class extends Account {}

describe('Account.Entity.AccountList', () => {
  let defaultAccountList
  let subjectUnderTest
  let logger
  let eventDispatcher
  let commandDispatcher

  beforeEach(() => {
    defaultAccountList = (num) => {
      const accounts = []
      let parentName = null
      for (let i = 1; i <= num; i++) {
        const parent = new AccountImpl(new AccountName(`account-${i}`), new Currency('USD'), parentName)
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

    // noinspection JSUnusedGlobalSymbols
    commandDispatcher = {
      subscribe: () => {}
    }

    subjectUnderTest = new AccountList(logger, commandDispatcher, eventDispatcher)
    subjectUnderTest.setup()
  })

  describe('constructor & setup', () => {
    it('should register all command handlers', () => {
      const expectedCommands = ['Account.createAccount', 'Account.linkAccounts', 'Account.addTags', 'Account.bookTransaction']

      let subscribeCallCount = 0
      commandDispatcher.subscribe = command => {
        assert.deepStrictEqual(command, expectedCommands[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountList(logger, commandDispatcher, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountList)
      accountList.setup()

      assert.strictEqual(subscribeCallCount, expectedCommands.length)
    })

    it('should register all event handlers', () => {
      const expectedEvents = [
        'Account.accountCreated',
        'Account.accountsLinked',
        'Account.tagsAdded',
        'Account.moneyAdded',
        'Account.moneyWithdrawn'
      ]

      let subscribeCallCount = 0
      eventDispatcher.subscribe = event => {
        assert.deepStrictEqual(event, expectedEvents[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountList(logger, commandDispatcher, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountList)
      accountList.setup()

      assert.strictEqual(subscribeCallCount, expectedEvents.length)
    })
  })

  describe('command handling functions', () => {
    const commands = [
      {
        name: 'Account.createAccount',
        payload: {
          name: 'account-1',
          type: 'bankaccount',
          currency: 'USD',
          metadata: { iban: '345678962298' }
        }
      },
      {
        name: 'Account.linkAccounts',
        payload: {
          subAccountName: 'account-2',
          parentAccountName: 'account-1'
        }
      },
      {
        name: 'Account.addTags',
        payload: {
          name: 'account-1',
          tags: ['car', 'service', 'repair']
        }
      },
      {
        name: 'Account.bookTransaction',
        payload: {
          account1: 'account-1',
          account2: 'account-1',
          amount: 123.45,
          currency: 'USD'
        }
      }
    ]

    for (const command of commands) {
      it(`should spread the payload of ${command.name} and pass it to the proper class methods`, async () => {
        let called = false
        subjectUnderTest[command.name.split('.')[1]] = async (...args) => {
          called = true
          const payloadValues = Object.values(command.payload)
          args.forEach((arg, index) => assert.deepStrictEqual(arg, payloadValues[index]))
        }

        await subjectUnderTest.execute({
          name: command.name,
          time: new Date().toISOString(),
          payload: command.payload
        })

        assert.ok(called, `Handler for command "${command.name}" was not called.`)
      })
    }
  })

  describe('event handling functions', () => {
    const events = [
      {
        name: 'Account.accountCreated',
        payload: {
          name: 'account-1',
          type: 'bankaccount',
          currency: 'USD',
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
      },
      {
        name: 'Account.moneyAdded',
        payload: {
          account: 'account-1',
          amount: 123.45,
          currency: 'USD'
        }
      },
      {
        name: 'Account.moneyWithdrawn',
        payload: {
          account: 'account-2',
          amount: 123.45,
          currency: 'USD'
        }
      }
    ]

    for (const event of events) {
      it(`should spread the payload for ${event} and pass it to the proper class methods`, async () => {
        let called = false
        subjectUnderTest[event.name.split('.')[1]] = async (...args) => {
          called = true
          const payloadValues = Object.values(event.payload)
          args.forEach((arg, index) => assert.deepStrictEqual(arg, payloadValues[index]))
        }

        await subjectUnderTest.apply({
          name: event.name,
          time: new Date().toISOString(),
          payload: event.payload
        })

        assert.ok(called, `Handler for event "${event.name}" was not called.`)
      })
    }
  })

  describe('createAccount', () => {
    it('should throw a proper validation error if the account name and type are invalid', async () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        await subjectUnderTest.createAccount('', '', '', {})
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(3)

        err.invalidFields.should.have.nested.property('[0].fieldName', 'name')
        err.invalidFields[0].message.should.match(/must not be an empty string/)

        err.invalidFields.should.have.nested.property('[1].fieldName', 'type')
        err.invalidFields[1].message.should.match(/must be one of/)

        err.invalidFields.should.have.nested.property('[2].fieldName', 'currency')
        err.invalidFields[1].message.should.match(/must be one of/)
      }

      assert.ok(thrown)
    })

    it('should throw a proper validation error if an account with the same name already exists', async () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        // noinspection JSCheckFunctionSignatures
        await subjectUnderTest.createAccount('account-1', 'debit', 'USD', { debit: { debitorName: 'test' } })
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'name')
        err.invalidFields[0].message.should.match(/already exists/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if the metadata for the account type is missing', async () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        await subjectUnderTest.createAccount('account-1', 'bankaccount', 'USD', {})
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'metadata')
        err.invalidFields[0].message.should.match(/^No metadata provided/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if the metadata for the account type is not an object', async () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        await subjectUnderTest.createAccount('account-1', 'bankaccount', 'USD', { bankaccount: [] })
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'metadata')
        err.invalidFields[0].message.should.match(/^Expected metadata to be an object./)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if metadata is invalid', async () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        await subjectUnderTest.createAccount('account-1', 'bankaccount', 'USD', {
          bankaccount: {
            institute: 'test',
            iban: '123456789',
            bic: '987654321'
          }
        })
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'metadata')
        err.invalidFields[0].message.should.match(/^Provided value is not a valid IBAN/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should return the accountCreated event', async () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      const expectedEvent = {
        name: 'Account.accountCreated',
        payload: {
          name: 'account-1',
          type: 'debit',
          currency: 'USD',
          metadata: { debit: { debitorName: 'Joe' } }
        },
        time: new Date().toISOString()
      }

      // noinspection JSCheckFunctionSignatures
      const events = await subjectUnderTest.createAccount(
        'account-1',
        'debit',
        'USD',
        { debit: { debitorName: 'Joe' } }
      )

      assert.deepStrictEqual(events[0], expectedEvent)

      clock.restore()
    })
  })

  describe('accountCreated', () => {
    it('should add the account to the list', async () => {
      const expectedAccountName = new AccountName('account-1')
      const expectedAccountDebitor = new DebitorName('Joe')

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.accountCreated('account-1', 'debit', 'USD', { debit: { debitorName: 'Joe' } })

      subjectUnderTest._accounts.should.be.an('array').that.has.lengthOf(1)
      subjectUnderTest._accounts[0].should.be.an.instanceOf(Debit)
      assert.ok(subjectUnderTest._accounts[0].name.equals(expectedAccountName))
      assert.ok(subjectUnderTest._accounts[0].debitorName.equals(expectedAccountDebitor))
    })
  })

  describe('linkAccounts', () => {
    it('should throw a proper ValidationError if the sub or parent account name is invalid', async () => {
      let thrown = false

      try {
        await subjectUnderTest.linkAccounts('', '')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(2)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'subAccountName')
        err.invalidFields.should.have.nested.property('[1].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/must not be an empty string.$/)
        err.invalidFields[1].message.should.match(/must not be an empty string.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if the parent account does not exist', async () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        await subjectUnderTest.linkAccounts('account-1', 'account-2')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/not found/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if the sub & parent accounts do not exist', async () => {
      let thrown = false

      try {
        await subjectUnderTest.linkAccounts('account-1101', 'account-1102')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(2)

        err.invalidFields.should.have.nested.property('[0].fieldName', 'subAccountName')
        err.invalidFields[0].message.should.match(/not found/)

        err.invalidFields.should.have.nested.property('[1].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/not found/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw an error when linking an account to itself', async () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        await subjectUnderTest.linkAccounts('account-1', 'account-1')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)

        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/to itself/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw an error when linking two accounts would create a circle', async () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(5)

      try {
        await subjectUnderTest.linkAccounts('account-1', 'account-5')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/close a circle/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw an error when linking two accounts would exceed the maximum branch path length', async () => {
      let thrown = false

      subjectUnderTest._accounts = [
        ...defaultAccountList(1000),
        new AccountImpl(new AccountName('account-1001'), new Currency('USD'))
      ]

      try {
        await subjectUnderTest.linkAccounts('account-1001', 'account-1000')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/exceed the maximum link depth/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should return an Account.accountsLinked event if all checks pass', async () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      subjectUnderTest._accounts = [
        new AccountImpl(new AccountName('account-1'), new Currency('USD')),
        new AccountImpl(new AccountName('account-2'), new Currency('USD'))
      ]

      assert.deepStrictEqual(
        await subjectUnderTest.linkAccounts('account-1', 'account-2'),
        [{
          name: 'Account.accountsLinked',
          time: new Date().toISOString(),
          payload: {
            subAccountName: 'account-1',
            parentAccountName: 'account-2'
          }
        }]
      )

      clock.restore()
    })
  })

  describe('accountsLinked', () => {
    it('should should set the parent account as the sub account\'s parent', async () => {
      const expectedParent = new AccountImpl(new AccountName('account-2'), new Currency('USD'))

      subjectUnderTest._accounts = [
        new AccountImpl(new AccountName('account-1'), new Currency('USD')),
        expectedParent
      ]

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.accountsLinked('account-1', 'account-2')

      subjectUnderTest._accounts[0].parent.should.be.an.instanceOf(Account)
      assert.strictEqual(subjectUnderTest._accounts[0].parent, expectedParent)
    })
  })

  describe('addTags', () => {
    it('should throw a proper ValidationError if the account name is invalid', async () => {
      let thrown = false

      try {
        await subjectUnderTest.addTags('', [])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/must not be an empty string.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if the account cannot be found', async () => {
      let thrown = false

      try {
        await subjectUnderTest.addTags('account-1', [])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/not found.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if tags are invalid', async () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        await subjectUnderTest.addTags('account-1', ['', '123'])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/must not be an empty string.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should not return an event if no tags were added', async () => {
      subjectUnderTest._accounts = defaultAccountList(1)

      assert.deepStrictEqual(await subjectUnderTest.addTags('account-1', []), [])
    })

    it('should return the Account.tagsAdded event if tags were added', async () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      subjectUnderTest._accounts = defaultAccountList(1)

      assert.deepStrictEqual(
        await subjectUnderTest.addTags('account-1', ['car', 'repair', 'service']),
        [{
          name: 'Account.tagsAdded',
          time: new Date().toISOString(),
          payload: {
            name: 'account-1',
            tags: ['car', 'repair', 'service']
          }
        }]
      )

      clock.restore()
    })

    it('should remove duplicate tags', async () => {
      subjectUnderTest._accounts = defaultAccountList(1)

      const events = await subjectUnderTest.addTags('account-1', ['car', 'car', 'repair', 'car', 'service'])

      events[0].payload.tags
        .should.be.an('array')
        .with.lengthOf(3)
        .that.has.same.members(['car', 'repair', 'service'])
    })
  })

  describe('tagsAdded', () => {
    it('should should add the tags to the proper account', async () => {
      const expectedAccount = new AccountImpl(new AccountName('account-1'), new Currency('USD'))
      const expectedTags = ['car', 'repair', 'service']
      subjectUnderTest._accounts = [expectedAccount]

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.tagsAdded('account-1', expectedTags)

      const rawTags = expectedAccount.tags.map(tag => tag.getValue())

      assert.deepStrictEqual(rawTags, expectedTags)
    })
  })
})
