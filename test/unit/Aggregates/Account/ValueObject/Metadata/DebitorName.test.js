const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const DebitorName = require('../../../../../../src/Aggregates/Account/ValueObject/Metadata/DebitorName')

describe('Account.ValueObject.DebitorName', () => {
  it('should throw an error if value is not string or empty string', () => {
    assert.throws(() => new DebitorName(), TypeError)
    assert.throws(() => new DebitorName(''), InvalidArgumentError)
  })
})
