const assert = require('assert')

const MetadataCreditCard = require('../../../../src/Aggregates/Account/ValueObject/MetadataCreditCard')

const InstituteFn = {}
const CCTypeFn = {}
const CCHolderFn = {}
const CCNumberFn = {}

const Institute = class {
  equals (value) { return InstituteFn.equals(value) }
  toString () { return InstituteFn.toString() }
}
const CreditCardType = class {
  equals (value) { return CCTypeFn.equals(value) }
  toString () { return CCTypeFn.toString() }
}

const CreditCardHolder = class {
  equals (value) { return CCHolderFn.equals(value) }
  toString () { return CCHolderFn.toString() }
}

const CreditCardNumber = class {
  equals (value) { return CCNumberFn.equals(value) }
  toString () { return CCNumberFn.toString() }
}

describe('MetadataCreditCard', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new MetadataCreditCard(
      new Institute(),
      new CreditCardType(),
      new CreditCardHolder(),
      new CreditCardNumber()
    )
  })

  it('should equal another instance if all properties are equal', () => {
    InstituteFn.equals = () => true
    CCTypeFn.equals = () => true
    CCHolderFn.equals = () => true
    CCNumberFn.equals = () => true

    assert.ok(subjectUnderTest.equals(
      new MetadataCreditCard(
        new Institute(),
        new CreditCardType(),
        new CreditCardHolder(),
        new CreditCardNumber()
      )
    ))
  })

  it('should return a human readable version of the object', () => {
    InstituteFn.toString = () => 'abc'
    CCTypeFn.toString = () => 'visa'
    CCHolderFn.toString = () => 'bob'
    CCNumberFn.toString = () => '123456789'

    assert.strictEqual(
      subjectUnderTest.toString(),
      'Institute: abc / Type: visa / Holder: bob / No.: 123456789')
  })
})
