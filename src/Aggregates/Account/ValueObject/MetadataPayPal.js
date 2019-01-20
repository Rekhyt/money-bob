class MetadataPayPal {
  /**
   * @param {EmailAddress} emailAddress
   */
  constructor (emailAddress) {
    this._emailAddress = emailAddress
  }

  /**
   * @returns {EmailAddress}
   */
  get emailAddress () {
    return this._emailAddress
  }

  /**
   * @param {MetadataPayPal} value
   * @returns {boolean}
   */
  equals (value) {
    return this._emailAddress.equals(value.emailAddress)
  }

  /**
   * @returns {string}
   */
  toString () {
    return `${this._emailAddress}`
  }
}

module.exports = MetadataPayPal
