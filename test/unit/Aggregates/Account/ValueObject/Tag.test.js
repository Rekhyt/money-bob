const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const Tag = require('../../../../../src/Aggregates/Account/ValueObject/Tag')

describe('Account.ValueObject.Tag', () => {
  it('should throw an error if value is not string or empty string', () => {
    assert.throws(() => new Tag(), TypeError)
    assert.throws(() => new Tag(''), InvalidArgumentError)
  })
})
