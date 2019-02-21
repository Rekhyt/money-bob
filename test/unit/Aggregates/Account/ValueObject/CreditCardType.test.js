const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const CreditCardType = require('../../../../../src/Aggregates/Account/ValueObject/CreditCardType')

describe('CreditCardType', () => {
  it('should throw an error if value is not an enum value', () => {
    assert.throws(() => new CreditCardType('not valid'), InvalidArgumentError)
  })

  it('should construct if value is a valid enum value', () => {
    [
      'visa',
      'mastercard',
      'american-express',
      'diners-club',
      'discover',
      'jcb',
      'unionpay',
      'maestro',
      'mir',
      'elo'
    ].map(value => new CreditCardType(value))
  })
})
