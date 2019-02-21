const assert = require('assert')
const { InvalidArgumentError } = require('ddd-js')

const Institute = require('../../../../../../src/Aggregates/Account/ValueObject/Metadata/Institute')

describe('Institute', () => {
  it('should throw an error if value is not string or empty string', () => {
    assert.throws(() => new Institute(), TypeError)
    assert.throws(() => new Institute(''), InvalidArgumentError)
  })
})
