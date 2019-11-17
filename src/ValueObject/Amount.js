const { InvalidTypeError } = require('ddd-js')

class Amount {
  /**
   * @param {int} amount The amount in _minor_ currency unit, e.g. dollarcent, eurocent, ...
   */
  constructor (amount) {
    if (!Number.isInteger(amount)) {
      throw new InvalidTypeError('integer', typeof amount)
    }

    this.amount = amount
  }

  /**
   * @returns {number}
   */
  getValue () {
    return this.amount
  }
}

module.exports = Amount
