const { StringValue } = require('ddd-js')

class DebitorName extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = DebitorName
