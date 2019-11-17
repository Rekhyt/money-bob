const { InvalidTypeError } = require('ddd-js')
const Dinero = require('dinero.js')

const Amount = require('./Amount')
const Currency = require('./Currency')

class Money {
  /**
   * @param {Amount} amount
   * @param {Currency} currency
   */
  constructor (amount, currency) {
    if (!(amount instanceof Amount)) {
      throw new InvalidTypeError('Amount', typeof amount)
    }

    if (!(currency instanceof Currency)) {
      throw new InvalidTypeError('Currency', typeof currency)
    }

    this.dinero = Dinero({ amount: amount.getValue(), currency: currency.getValue() })
    this.amount = amount
    this.currency = currency
  }

  /**
   * @returns {Amount}
   */
  getAmount () {
    return this.amount
  }

  /**
   * @returns {Currency}
   */
  getCurrency () {
    return this.currency
  }

  /**
   * @param {Money} amount
   */
  add (amount) {
    this.dinero = this.dinero.add(amount.dinero)
    this.amount = this.dinero.getAmount()
  }

  /**
   * @param {Money} amount
   */
  subtract (amount) {
    this.dinero = this.dinero.subtract(amount.dinero)
    this.amount = this.dinero.getAmount()
  }

  /**
   * @returns {string}
   */
  toString () {
    return this.toFormat('0.0,00 $', 'HALF_AWAY_FROM_ZERO')
  }

  /**
   * @param {string} format
   * @param {string} roundingMode
   * @returns {string}
   *
   * @see https://sarahdayan.github.io/dinero.js/module-Dinero.html#~toFormat
   */
  toFormat (format, roundingMode) {
    return this.dinero.toFormat(format, roundingMode)
  }
}

module.exports = Money
