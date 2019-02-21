const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

describe('AccountName', () => {
  it('should throw an error if value is not string or empty string', () => {
    assert.throws(() => new AccountName(), TypeError)
    assert.throws(() => new AccountName(''), InvalidArgumentError)
  })
})
