/**
 * @abstract
 */
class Account {
  /**
   * @param {AccountName} name
   */
  constructor (name) {
    this.name = name
    this.parent = null
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
