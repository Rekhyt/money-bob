const { StringValue, InvalidArgumentError } = require('ddd-js')
const ibantools = require('ibantools')

class Iban extends StringValue {
  /**
   * @param {string} value
   */
  constructor (value) {
    if (!ibantools.isValidIBAN(value)) {
      throw new InvalidArgumentError(`Provided value is not a valid IBAN: ${value}"`)
    }

    super(ibantools.electronicFormatIBAN(value))
  }

  /**
   * @param {Iban} value
   * @returns {boolean}
   */
  equals (value) {
    return value instanceof Iban && this._value === value.getValue()
  }

  /**
   * @returns {string}
   */
  toString () {
    return ibantools.friendlyFormatIBAN(this._value)
  }
}

module.exports = Iban
