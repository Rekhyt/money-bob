const { StringValue } = require('ddd-js')

class Notes extends StringValue {
  constructor (value) {
    super(value, true)
  }
}

module.exports = Notes
