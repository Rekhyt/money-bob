const assert = require('assert')

const MetadataLiability = require('../../../../src/Aggregates/Account/ValueObject/MetadataLiability')

const DebitorFn = {}

const DebitorName = class {
  equals (value) { return DebitorFn.equals(value) }
  toString () { return DebitorFn.toString() }
}

describe('MetadataLiability', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new MetadataLiability(new DebitorName())
  })

  it('should equal another instance if all properties are equal', () => {
    DebitorFn.equals = () => true

    assert.ok(subjectUnderTest.equals(new MetadataLiability(new DebitorName())))
  })

  it('should return a human readable version of the object', () => {
    DebitorFn.toString = () => 'john'

    assert.strictEqual(subjectUnderTest.toString(), 'john')
  })
})
