const assert = require('assert')

const MetadataDebit = require('../../../../../src/Aggregates/Account/ValueObject/MetadataDebit')

const DebitorFn = {}

const DebitorName = class {
  equals (value) { return DebitorFn.equals(value) }
  toString () { return DebitorFn.toString() }
}

describe('MetadataDebit', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new MetadataDebit(new DebitorName())
  })

  it('should equal another instance if all properties are equal', () => {
    DebitorFn.equals = () => true

    assert.ok(subjectUnderTest.equals(new MetadataDebit(new DebitorName())))
  })

  it('should return a human readable version of the object', () => {
    DebitorFn.toString = () => 'john'

    assert.strictEqual(subjectUnderTest.toString(), 'john')
  })
})
