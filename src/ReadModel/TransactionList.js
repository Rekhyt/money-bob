const { ReadModel } = require('ddd-js')

class TransactionList extends ReadModel {
  setup () {
    /** @property {TransactionReadModel[]} */
    this._transactions = []

    this.registerEvent(
      'Transaction.transactionBooked',
      async event => this.transactionBooked(
        event.payload.account1,
        event.payload.account2,
        event.payload.amount,
        event.payload.currency,
        event.payload.subject,
        event.payload.notes,
        event.payload.transactionTime,
        event.payload.tags
      )
    )
  }

  /**
   * @returns {TransactionReadModel[]}
   */
  get transactions () {
    return this._transactions
  }

  /**
   * @param {string} account1
   * @param {string} account2
   * @param {number} amount
   * @param {string} currency
   * @param {string} subject
   * @param {string} notes
   * @param {string} transactionTime
   * @param {string[]} tags
   * @returns {Promise<void>}
   */
  async transactionBooked (account1, account2, amount, currency, subject, notes, transactionTime, tags = []) {
    this._transactions.push({ account1, account2, amount, currency, subject, notes, transactionTime, tags })
  }
}

module.exports = TransactionList
