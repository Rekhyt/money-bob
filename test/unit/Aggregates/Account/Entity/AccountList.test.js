const assert = require('assert')
const chai = require('chai')
chai.should()

const { ValidationError } = require('ddd-js')
const AccountList = require('../../../../../src/Aggregates/Account/Entity/AccountList')
const Account = require('../../../../../src/Aggregates/Account/Entity/Account')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

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
      trace: (...args) => {},
      debug: (...args) => {},
      info: (...args) => {},
      warn: (...args) => console.log(args),
      error: (...args) => console.log(args)
    }

    eventDispatcher = {
      subscribe: () => {}
    }

    commandDispatcher = {
      subscribe: () => {}
    }

    subjectUnderTest = new AccountList(logger, eventDispatcher, commandDispatcher, defaultAccountList(1100))
  })

  describe('linkAccounts', () => {
    it('should throw a proper ValidationError if the parent account does not exist', () => {
      let thrown = false
      let events = null

      try {
        events = subjectUnderTest.linkAccounts('account-995', 'account-1101')
        assert.fail('Expected a ValidationError to be thrown.')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceof(ValidationError)
        err.message.should.be.a('string').that.matches(/: parentAccountName$/)

        const invalidField = err.invalidFields.find(field => field.fieldName === 'parentAccountName')
        if (!invalidField || !invalidField.message) {
          assert.fail('"parent account" was expected to be listed as an invalid field with proper message.')
        }

        invalidField.message.should.match(/^Parent account .+" not found.$/)
      }

      assert.strictEqual(thrown, true, 'Expected a ValidationError to be thrown.')
      assert.strictEqual(events, null)
    })

    it('should throw a proper ValidationError if the sub & parent accounts do not exist', () => {
      let thrown = false
      let events = null

      try {
        events = subjectUnderTest.linkAccounts('account-1101', 'account-1102')
        assert.fail('Expected a ValidationError to be thrown.')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceof(ValidationError)
        err.message.should.be.a('string').that.matches(/: subAccountName, parentAccountName$/)

        const invalidFieldSub = err.invalidFields.find(field => field.fieldName === 'subAccountName')
        if (!invalidFieldSub || !invalidFieldSub.message) {
          assert.fail('"subAccountName" was expected to be listed as an invalid field with proper message.')
        }

        const invalidFieldParent = err.invalidFields.find(field => field.fieldName === 'parentAccountName')
        if (!invalidFieldParent || !invalidFieldParent.message) {
          assert.fail('"parentAccountName" was expected to be listed as an invalid field with proper message.')
        }

        invalidFieldSub.message.should.match(/^Sub account .+" not found.$/)
        invalidFieldParent.message.should.match(/^Parent account .+" not found.$/)
      }

      assert.strictEqual(thrown, true, 'Expected a ValidationError to be thrown.')
      assert.strictEqual(events, null)
    })

    it('should throw an error when linking an account to itself', () => {
      let thrown = false
      let events = null

      try {
        events = subjectUnderTest.linkAccounts('account-995', 'account-995')
        assert.fail('Expected a ValidationError to be thrown.')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceof(ValidationError)
        err.message.should.be.a('string').that.matches(/: parentAccountName$/)

        const invalidField = err.invalidFields.find(field => field.fieldName === 'parentAccountName')
        if (!invalidField || !invalidField.message) {
          assert.fail('"parentAccountName" was expected to be listed as an invalid field with proper message.')
        }

        invalidField.message.should.match(/^Cannot link account ".+" to itself.$/)
      }

      assert.strictEqual(thrown, true, 'Expected a ValidationError to be thrown.')
      assert.strictEqual(events, null)
    })

    it('should throw an error when linking two accounts would create a circle', () => {
      let thrown = false
      let events = null

      try {
        events = subjectUnderTest.linkAccounts('account-1', 'account-995')
        assert.fail('Expected a ValidationError to be thrown.')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceof(ValidationError)
        err.message.should.be.a('string').that.matches(/: parentAccountName$/)

        const invalidField = err.invalidFields.find(field => field.fieldName === 'parentAccountName')
        if (!invalidField || !invalidField.message) {
          assert.fail('"parentAccountName" was expected to be listed as an invalid field with proper message.')
        }

        invalidField.message.should.match(/^Cannot link account .+ as that would close a circle:/)
      }

      assert.strictEqual(thrown, true, 'Expected a ValidationError to be thrown.')
      assert.strictEqual(events, null)
    })

    it('should throw an error when linking two accounts would exceed the maximum branch path length', () => {
      let thrown = false
      let events = null

      try {
        events = subjectUnderTest.linkAccounts('account-1001', 'account-1000')
      } catch (err) {
        thrown = true
        err.should.be.an.instanceof(ValidationError)
        err.message.should.be.a('string').that.matches(/: parentAccountName$/)

        const invalidField = err.invalidFields.find(field => field.fieldName === 'parentAccountName')
        if (!invalidField || !invalidField.message) {
          assert.fail('"parentAccountName" was expected to be listed as an invalid field with proper message.')
        }

        invalidField.message.should.match(/^Cannot link .+ exceed the maximum link depth of 1000.$/)
      }

      assert.strictEqual(thrown, true, 'Expected a ValidationError to be thrown.')
      assert.strictEqual(events, null)
    })
  })
})
