const assert = require('assert')
const proxyquire = require('proxyquire')
const { InvalidArgumentError } = require('ddd-js')

const ibantools = {}
const Bic = proxyquire('../../../../../src/Aggregates/Account/ValueObject/Bic', { ibantools })

describe('Account.ValueObject.Bic', () => {
  it('should throw an error if value is not a valid BIC', () => {
    ibantools.isValidBIC = () => false
    assert.throws(() => new Bic('3456789'), InvalidArgumentError)
  })

  it('should construct if value is a valid BIC', () => {
    ibantools.isValidBIC = () => true
    assert.ok(new Bic('2345678'))
  })
})
