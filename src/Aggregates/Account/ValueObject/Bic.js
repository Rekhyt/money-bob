const { StringValue, InvalidArgumentError } = require('ddd-js')
const ibantools = require('ibantools')

class Bic extends StringValue {
  constructor (value) {
    if (!ibantools.isValidBIC(value)) {
      throw new InvalidArgumentError(`Provided value is not a valid BIC: ${value}"`)
    }

    super(value)
  }
}

module.exports = Bic
