const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const AccountType = require('../../../../../src/Aggregates/Account/ValueObject/AccountType')

describe('AccountType', () => {
  it('should throw an error if value is not an enum value', () => {
    assert.throws(() => new AccountType('not valid'), InvalidArgumentError)
  })

  it('should construct if value is a valid enum value', () => {
    [
      'bankaccount',
      'creditcard',
      'paypal',
      'debit',
      'liability'
    ].map(value => new AccountType(value))
  })
})
