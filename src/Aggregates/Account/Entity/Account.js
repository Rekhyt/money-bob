/**
 * @abstract
 */
class Account {
  /**
   * @param {AccountName} name
   * @param {Account?} parent
   */
  constructor (name, parent = null) {
    this.name = name
    this.parent = parent
  }

  /**
   * @param {Account} account
   * @returns {boolean}
   */
  equals (account) {
    return account.constructor.name === this.constructor.name && account.name.equals(this.name)
  }
  /**
   * @param {string[]} requiredFields
   * @param {*} metadata
   * @returns {*}
   */
  static validateMetadataFieldsExisting (requiredFields, metadata) {
    return requiredFields.filter(key => !metadata.hasOwnProperty(key))
  }
}

module.exports = Account
