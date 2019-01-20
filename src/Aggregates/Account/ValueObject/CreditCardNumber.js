const { StringValue, InvalidArgumentError } = require('ddd-js')
const validator = require('card-validator')

class CreditCardNumber extends StringValue {
  constructor (value) {
    if (!validator.number(value).isValid) {
      throw new InvalidArgumentError(`Provided value is not a valid credit card number: ${value}`)
    }

    super(value)
  }
}

module.exports = CreditCardNumber
