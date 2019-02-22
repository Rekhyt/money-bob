const assert = require('assert')
const sinon = require('sinon')
const chai = require('chai')
chai.should()

const { ValidationError } = require('ddd-js')
const AccountList = require('../../../../../src/Aggregates/Account/Entity/AccountList')
const Account = require('../../../../../src/Aggregates/Account/Entity/Account')
const Debit = require('../../../../../src/Aggregates/Account/Entity/Debit')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')
const DebitorName = require('../../../../../src/Aggregates/Account/ValueObject/Metadata/DebitorName')

const AccountImpl = class extends Account {}

describe('AccountList', () => {
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
        const parent = new AccountImpl(new AccountName(`account-${i}`), parentName)
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
  })

  describe('constructor', () => {
    it('should register all command handlers', () => {
      const expectedCommands = ['Account.createAccount', 'Account.linkAccounts', 'Account.addTags']

      let subscribeCallCount = 0
      commandDispatcher.subscribe = command => {
        assert.deepStrictEqual(command, expectedCommands[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountList(logger, commandDispatcher, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountList)

      assert.strictEqual(subscribeCallCount, expectedCommands.length)
    })

    it('should register all event handlers', () => {
      const expectedEvents = ['Account.accountCreated', 'Account.accountsLinked', 'Account.tagsAdded']

      let subscribeCallCount = 0
      eventDispatcher.subscribe = event => {
        assert.deepStrictEqual(event, expectedEvents[subscribeCallCount])
        subscribeCallCount++
      }

      const accountList = new AccountList(logger, commandDispatcher, eventDispatcher)
      accountList.should.be.an.instanceOf(AccountList)

      assert.strictEqual(subscribeCallCount, expectedEvents.length)
    })
  })

  describe('command & event handling functions', () => {
    it('should spread the command payloads and pass them to the proper class methods', () => {
      const commands = [
        {
          name: 'Account.createAccount',
          payload: {
            name: 'account-1',
            type: 'bankaccount',
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
        }
      ]

      commands.forEach(command => {
        let called = false
        subjectUnderTest[command.name.split('.')[1]] = (...args) => {
          called = true
          const payloadValues = Object.values(command.payload)
          args.forEach((arg, index) => {
            assert.deepStrictEqual(arg, payloadValues[index])
          })
        }

        subjectUnderTest.execute({
          name: command.name,
          time: new Date().toISOString(),
          payload: command.payload
        })

        assert.ok(called, `Handler for command "${command.name}" was not called.`)
      })
    })

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

  describe('createAccount', () => {
    it('should throw a proper validation error if the account name and type are invalid', () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        subjectUnderTest.createAccount('', '', {})
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(2)

        err.invalidFields.should.have.nested.property('[0].fieldName', 'name')
        err.invalidFields[0].message.should.match(/must not be an empty string/)

        err.invalidFields.should.have.nested.property('[1].fieldName', 'type')
        err.invalidFields[1].message.should.match(/must be one of/)
      }

      assert.ok(thrown)
    })

    it('should throw a proper validation error if an account with the same name already exists', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        // noinspection JSCheckFunctionSignatures
        subjectUnderTest.createAccount('account-1', 'debit', { debit: { debitorName: 'test' } })
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'name')
        err.invalidFields[0].message.should.match(/already exists/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if the metadata for the account type is missing', () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        subjectUnderTest.createAccount('account-1', 'bankaccount', {})
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'metadata')
        err.invalidFields[0].message.should.match(/^No metadata provided/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if the metadata for the account type is not an object', () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        subjectUnderTest.createAccount('account-1', 'bankaccount', { bankaccount: [] })
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'metadata')
        err.invalidFields[0].message.should.match(/^Expected metadata to be an object./)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper error if metadata is invalid', () => {
      let thrown = false

      try {
        // noinspection JSCheckFunctionSignatures
        subjectUnderTest.createAccount('account-1', 'bankaccount', {
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

    it('should return the accountCreated event', () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      const expectedEvent = {
        name: 'Account.accountCreated',
        payload: {
          name: 'account-1',
          type: 'debit',
          metadata: { debit: { debitorName: 'Joe' } }
        },
        time: new Date().toISOString()
      }

      // noinspection JSCheckFunctionSignatures
      const events = subjectUnderTest.createAccount(
        'account-1',
        'debit', { debit: { debitorName: 'Joe' } }
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
      await subjectUnderTest.accountCreated('account-1', 'debit', { debit: { debitorName: 'Joe' } })

      subjectUnderTest._accounts.should.be.an('array').that.has.lengthOf(1)
      subjectUnderTest._accounts[0].should.be.an.instanceOf(Debit)
      assert.ok(subjectUnderTest._accounts[0].name.equals(expectedAccountName))
      assert.ok(subjectUnderTest._accounts[0].debitorName.equals(expectedAccountDebitor))
    })
  })

  describe('linkAccounts', () => {
    it('should throw a proper ValidationError if the sub or parent account name is invalid', () => {
      let thrown = false

      try {
        subjectUnderTest.linkAccounts('', '')
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

    it('should throw a proper ValidationError if the parent account does not exist', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        subjectUnderTest.linkAccounts('account-1', 'account-2')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/not found/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if the sub & parent accounts do not exist', () => {
      let thrown = false

      try {
        subjectUnderTest.linkAccounts('account-1101', 'account-1102')
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

    it('should throw an error when linking an account to itself', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        subjectUnderTest.linkAccounts('account-1', 'account-1')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)

        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/to itself/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw an error when linking two accounts would create a circle', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(5)

      try {
        subjectUnderTest.linkAccounts('account-2', 'account-5')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/close a circle/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw an error when linking two accounts would exceed the maximum branch path length', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1001)

      try {
        subjectUnderTest.linkAccounts('account-1001', 'account-1000')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').that.has.lengthOf(1)
        err.invalidFields.should.have.nested.property('[0].fieldName', 'parentAccountName')
        err.invalidFields[0].message.should.match(/exceed the maximum link depth/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should return an Account.accountsLinked event if all checks pass', () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      subjectUnderTest._accounts = [
        new AccountImpl(new AccountName('account-1')),
        new AccountImpl(new AccountName('account-2'))
      ]

      assert.deepStrictEqual(
        subjectUnderTest.linkAccounts('account-1', 'account-2'),
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
      const expectedParent = new AccountName('account-2')

      subjectUnderTest._accounts = [
        new AccountImpl(new AccountName('account-1')),
        new AccountImpl(expectedParent)
      ]

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.accountsLinked('account-1', 'account-2')

      subjectUnderTest._accounts[0].parent.should.be.an.instanceOf(AccountName)
      assert.ok(subjectUnderTest._accounts[0].parent.equals(new AccountName('account-2')))
    })
  })

  describe('addTags', () => {
    it('should throw a proper ValidationError if the account name is invalid', () => {
      let thrown = false

      try {
        subjectUnderTest.addTags('', [])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/must not be an empty string.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if the account cannot be found', () => {
      let thrown = false

      try {
        subjectUnderTest.addTags('account-1', [])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/not found.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should throw a proper ValidationError if tags are invalid', () => {
      let thrown = false

      subjectUnderTest._accounts = defaultAccountList(1)

      try {
        subjectUnderTest.addTags('account-1', ['', '123'])
      } catch (err) {
        thrown = true
        err.should.be.an.instanceOf(ValidationError)
        err.invalidFields.should.be.an('array').with.lengthOf(1)
        err.invalidFields[0].message.should.match(/must not be an empty string.$/)
      }

      assert.ok(thrown, 'Expected a ValidationError to be thrown.')
    })

    it('should not return an event if no tags were added', () => {
      subjectUnderTest._accounts = defaultAccountList(1)

      assert.deepStrictEqual(subjectUnderTest.addTags('account-1', []), [])
    })

    it('should return the Account.tagsAdded event if tags were added', () => {
      const clock = sinon.useFakeTimers({ now: Date.now() })

      subjectUnderTest._accounts = defaultAccountList(1)

      assert.deepStrictEqual(
        subjectUnderTest.addTags('account-1', ['car', 'repair', 'service']),
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

    it('should remove duplicate tags', () => {
      subjectUnderTest._accounts = defaultAccountList(1)

      subjectUnderTest.addTags('account-1', ['car', 'car', 'repair', 'car', 'service'])[0].payload.tags
        .should.be.an('array')
        .with.lengthOf(3)
        .that.has.same.members(['car', 'repair', 'service'])
    })
  })

  describe('tagsAdded', () => {
    it('should should add the tags to the proper account', async () => {
      const expectedAccount = new AccountImpl(new AccountName('account-1'))
      const expectedTags = ['car', 'repair', 'service']
      subjectUnderTest._accounts = [expectedAccount]

      // noinspection JSCheckFunctionSignatures
      await subjectUnderTest.tagsAdded('account-1', expectedTags)

      const rawTags = expectedAccount.tags.map(tag => tag.getValue())

      assert.deepStrictEqual(rawTags, expectedTags)
    })
  })
})
