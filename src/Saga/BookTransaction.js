const { Saga } = require('ddd-js')

class BookTransaction extends Saga {
  setup () {
    this.registerCommand('BookTransaction.bookTransaction', async command => this.bookTransaction(command.payload))
  }

  /**
   * @param {object} payload
   * @returns {Event[]}
   * @throws {SagaError} if execution fails
   */
  async bookTransaction (payload) {
    const identifier = this.provision()

    const reverseTransactionPayload = {
      ...payload,
      notes: `[ROLLBACK] ${payload.notes}`,
      account1: payload.account2,
      account2: payload.account1
    }

    this.addTask(
      identifier,
      'Account',
      { name: 'Account.bookTransaction', payload: { ...payload }, time: new Date().toJSON() },
      () => {
        return { name: 'Account.bookTransaction', payload: { ...reverseTransactionPayload }, time: new Date().toJSON() }
      },
      5000
    )

    this.addTask(
      identifier,
      'Transaction',
      { name: 'Transaction.bookTransaction', payload: { ...payload }, time: new Date().toJSON() },
      () => {
        return { name: 'Transaction.bookTransaction', payload: { ...reverseTransactionPayload }, time: new Date().toJSON() }
      },
      5000
    )

    await this.run(identifier)

    return []
  }
}

module.exports = BookTransaction
