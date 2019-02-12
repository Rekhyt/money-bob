const { StringValue } = require('ddd-js')

class CreditCardHolder extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = CreditCardHolder
