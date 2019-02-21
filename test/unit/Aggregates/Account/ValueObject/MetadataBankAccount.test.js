const assert = require('assert')

const MetadataBankAccount = require('../../../../../src/Aggregates/Account/ValueObject/MetadataBankAccount')

const InstituteFn = {}
const IbanFn = {}
const BicFn = {}

const Institute = class {
  equals (value) { return InstituteFn.equals(value) }
  toString () { return InstituteFn.toString() }
}

const Iban = class {
  equals (value) { return IbanFn.equals(value) }
  toString () { return IbanFn.toString() }
}

const Bic = class {
  equals (value) { return BicFn.equals(value) }
  toString () { return BicFn.toString() }
}

describe('MetadataBankAccount', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new MetadataBankAccount(
      new Institute(),
      new Iban(),
      new Bic()
    )
  })

  it('should equal another instance if all properties are equal', () => {
    InstituteFn.equals = () => true
    IbanFn.equals = () => true
    BicFn.equals = () => true

    assert.ok(subjectUnderTest.equals(new MetadataBankAccount(new Institute(), new Iban(), new Bic())))
  })

  it('should return a human readable version of the object', () => {
    InstituteFn.toString = () => 'abc'
    IbanFn.toString = () => '123456'
    BicFn.toString = () => '456789'

    assert.strictEqual(subjectUnderTest.toString(), 'IBAN: 123456 / BIC: 456789 (abc)')
  })
})
