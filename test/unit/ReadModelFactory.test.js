const assert = require('assert')
const chai = require('chai')
chai.should()

const ReadModelFactory = require('../../src/ReadModelFactory')
const AccountList = require('../../src/ReadModel/AccountList')
const AccountTree = require('../../src/ReadModel/AccountTree')

describe('ReadModelFactory', () => {
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

    subjectUnderTest = new ReadModelFactory(logger, eventDispatcher)
  })

  describe('createAccountList()', () => {
    it('should create an empty AccountList read model', () => {
      const accountList = subjectUnderTest.createAccountList()

      accountList.should.be.an.instanceOf(AccountList)
      accountList._accounts.should.be.an('array').with.lengthOf(0)
    })

    it('should create an AccountList read model with given accounts', () => {
      const accountList = subjectUnderTest.createAccountList([1, 2, 3])

      accountList.should.be.an.instanceOf(AccountList)
      accountList._accounts
        .should.be.an('array')
        .with.lengthOf(3)
        .that.has.members([1, 2, 3])
    })
  })

  describe('createAccountTree()', () => {
    it('should create an empty AccountTree read model', () => {
      const accountTree = subjectUnderTest.createAccountTree()

      accountTree.should.be.an.instanceOf(AccountTree)
      accountTree._accountList.should.be.an('array').with.lengthOf(0)
    })

    it('should create an AccountList read model with given accounts', () => {
      const accountTree = subjectUnderTest.createAccountTree([1, 2, 3])

      accountTree.should.be.an.instanceOf(AccountTree)
      accountTree._accountList
        .should.be.an('array')
        .with.lengthOf(3)
        .that.has.members([1, 2, 3])
    })
  })
})
