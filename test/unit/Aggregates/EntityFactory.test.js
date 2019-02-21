const assert = require('assert')
const chai = require('chai')
chai.should()

const EntityFactory = require('../../../src/Aggregates/EntityFactory')
const AccountList = require('../../../src/Aggregates/Account/Entity/AccountList')

describe('EntityFactory', () => {
  let subjectUnderTest
  let logger
  let commandDispatcher
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

    // noinspection JSUnusedGlobalSymbols
    commandDispatcher = {
      subscribe: () => {}
    }

    subjectUnderTest = new EntityFactory(logger, commandDispatcher, eventDispatcher)
  })

  describe('createAccountList()', () => {
    it('should create an empty AccountList entity', () => {
      const accountList = subjectUnderTest.createAccountList()

      accountList.should.be.an.instanceOf(AccountList)
      accountList._accounts.should.be.an('array').with.lengthOf(0)
    })

    it('should create an AccountList entity with given accounts', () => {
      const accountList = subjectUnderTest.createAccountList([1, 2, 3])

      accountList.should.be.an.instanceOf(AccountList)
      accountList._accounts
        .should.be.an('array')
        .with.lengthOf(3)
        .that.has.members([1, 2, 3])
    })
  })
})
