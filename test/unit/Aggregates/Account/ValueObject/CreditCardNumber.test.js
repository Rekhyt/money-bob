const assert = require('assert')
const proxyquire = require('proxyquire')
const { InvalidArgumentError } = require('ddd-js')

const cardValidator = {}
const CreditCardNumber = proxyquire('../../../../../src/Aggregates/Account/ValueObject/CreditCardNumber', {
  'card-validator': cardValidator
})

describe('CreditCardNumber', () => {
  it('should throw an error if value is not a valid credit card number', () => {
    cardValidator.number = () => { return { isValid: false } }
    assert.throws(() => new CreditCardNumber('3456789'), InvalidArgumentError)
  })

  it('should construct if value is a valid BIC', () => {
    cardValidator.number = () => { return { isValid: true } }
    assert.ok(new CreditCardNumber('2345678'))
  })
})
