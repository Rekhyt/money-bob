const assert = require('assert')
const proxyquire = require('proxyquire')
const { InvalidArgumentError } = require('ddd-js')

const ibantools = {}
const Iban = proxyquire('../../../../../src/Aggregates/Account/ValueObject/Iban', { ibantools })

describe('Iban', () => {
  it('should throw an error if value is not a valid IBAN', () => {
    ibantools.isValidIBAN = () => false
    assert.throws(() => new Iban('3456789'), InvalidArgumentError)
  })

  it('should construct if value is a valid IBAN', () => {
    ibantools.isValidIBAN = () => true
    assert.ok(new Iban('2345678'))
  })

  describe('getValue()', () => {
    it('should return an "electronic friendly" version of itself', () => {
      ibantools.isValidIBAN = () => true
      ibantools.electronicFormatIBAN = () => 'e-friendly'

      assert.strictEqual(new Iban('abc').getValue(), 'e-friendly')
    })
  })

  describe('toString()', () => {
    it('should return a "human friendly" version of itself', () => {
      ibantools.isValidIBAN = () => true
      ibantools.electronicFormatIBAN = () => 'e-friendly'
      ibantools.friendlyFormatIBAN = () => 'human friendly'

      assert.strictEqual(new Iban('abc').toString(), 'human friendly')
    })
  })
})
