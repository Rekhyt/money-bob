const { StringValue } = require('ddd-js')

class Holder extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = Holder
