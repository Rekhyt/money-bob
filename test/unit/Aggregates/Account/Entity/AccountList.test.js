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

    logger = {
      // trace: (...args) => {},
      debug: (...args) => {},
      // info: (...args) => {},
      // warn: (...args) => console.log(args),
      error: (...args) => console.log(args)
    }

    eventDispatcher = {
      // subscribe: () => {}
    }

    commandDispatcher = {
      // subscribe: () => {}
    }

    subjectUnderTest = new AccountList(logger, eventDispatcher, commandDispatcher)
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
        subjectUnderTest.linkAccounts('account-1', 'account-5')
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
  })
})
