const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const CreditCardHolder = require('../../../../../../src/Aggregates/Account/ValueObject/Metadata/CreditCardHolder')

describe('CreditCardHolder', () => {
  it('should throw an error if value is not string or empty string', () => {
    assert.throws(() => new CreditCardHolder(), TypeError)
    assert.throws(() => new CreditCardHolder(''), InvalidArgumentError)
  })
})
