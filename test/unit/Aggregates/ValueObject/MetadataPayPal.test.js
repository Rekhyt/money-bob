const assert = require('assert')

const MetadataPayPal = require('../../../../src/Aggregates/Account/ValueObject/MetadataPayPal')

const EmailFn = {}

const EmailAddress = class {
  equals (value) { return EmailFn.equals(value) }
  toString () { return EmailFn.toString() }
}

describe('MetadataPayPal', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new MetadataPayPal(new EmailAddress())
  })

  it('should equal another instance if all properties are equal', () => {
    EmailFn.equals = () => true

    assert.ok(subjectUnderTest.equals(new MetadataPayPal(new EmailAddress())))
  })

  it('should return a human readable version of the object', () => {
    EmailFn.toString = () => 'bob@weird-webdesign.com'

    assert.strictEqual(subjectUnderTest.toString(), 'bob@weird-webdesign.com')
  })
})
