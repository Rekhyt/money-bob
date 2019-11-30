class Transaction {
  /**
   * @param {AccountName} account1
   * @param {AccountName} account2
   * @param {Money} amount
   * @param {Subject} subject
   * @param {Notes} notes
   * @param {TransactionTime} transactionTime
   */
  constructor (account1, account2, amount, subject, notes, transactionTime) {
    this.account1 = account1
    this.account2 = account2
    this.amount = amount
    this.subject = subject
    this.notes = notes
    this.transactionTime = transactionTime
  }
}

module.exports = Transaction
