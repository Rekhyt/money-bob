const { Saga } = require('ddd-js')

class BookTransaction extends Saga {
  constructor (logger, commandDispatcher) {
    super(logger, commandDispatcher)

    this.registerCommand('BookTransaction.bookTransaction', async command => this.bookTransaction(command.payload))
  }

  /**
   * @param {object} payload
   * @returns {Event[]}
   * @throws {SagaError} if execution fails
   */
  async bookTransaction (payload) {
    const identifier = this.provision()

    const reverseTransactionPayload = { ...payload, account1: payload.account2, account2: payload.account1 }

    this.addTask(
      identifier,
      { name: 'Account.bookTransaction', payload: { ...payload }, time: new Date().toJSON() },
      'Account',
      () => {
        return { name: 'Account.bookTransaction', payload: { ...reverseTransactionPayload }, time: new Date().toJSON() }
      }
    )

    this.addTask(
      identifier,
      { name: 'Transaction.bookTransaction', payload: { ...payload }, time: new Date().toJSON() },
      'Transaction',
      () => {
        return { name: 'Account.bookTransaction', payload: { ...reverseTransactionPayload }, time: new Date().toJSON() }
      }
    )

    await this.run(identifier)

    return []
  }
}

module.exports = BookTransaction
