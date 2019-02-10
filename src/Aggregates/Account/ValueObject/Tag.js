const { StringValue } = require('ddd-js')

class Tag extends StringValue {
  constructor (value) {
    super(value, false)
  }
}

module.exports = Tag
