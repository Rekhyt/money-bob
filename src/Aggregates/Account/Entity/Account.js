/**
 * @abstract
 */
class Account {
  /**
   * @param {AccountName} name
   * @param {Account?} parent
   * @param {Tag[]?} tags
   */
  constructor (name, parent = null, tags = []) {
    this.name = name
    this.parent = parent
    this.tags = tags
  }

  /**
   * @param {Account} account
   * @returns {boolean}
   */
  equals (account) {
    return account.constructor.name === this.constructor.name && account.name.equals(this.name)
  }

  /**
   * @param {Tag[]} tags
   */
  addTags (tags) {
    this.tags.push(...tags.filter(tag => !this.tags.find(existingTag => tag.equals(existingTag))))
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
