const { ValidationError } = require('ddd-js')

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
    this._name = name
    this._parent = parent
    this._tags = tags
  }

  /**
   * @returns {AccountName}
   */
  get name () {
    return this._name
  }

  /**
   * @returns {Account}
   */
  get parent () {
    return this._parent
  }

  /**
   * @returns {Tag[]}
   */
  get tags () {
    return this._tags
  }

  /**
   * @param {Account} account
   * @returns {boolean}
   */
  equals (account) {
    return account.constructor.name === this.constructor.name && account._name.equals(this._name)
  }

  /**
   * @param {AccountName} parentAccountName
   */
  linkAccount (parentAccountName) {
    this._parent = parentAccountName
  }

  /**
   * @param {Tag[]} tags
   */
  addTags (tags) {
    this._tags.push(...tags.filter(tag => !this._tags.find(existingTag => tag.equals(existingTag))))
  }

  /**
   * @param {string[]} requiredFields
   * @param {*} metadata
   * @throws ValidationError if a required metadata field is missing
   */
  static validateMetadataFieldsExisting (requiredFields, metadata) {
    const missingFields = requiredFields.filter(key => !metadata.hasOwnProperty(key))

    if (missingFields.length === 0) return

    throw new ValidationError(
      missingFields.map(fieldName => { return { fieldName, message: `${fieldName} is a required field.` } })
    )
  }
}

module.exports = Account
