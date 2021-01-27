class Transaction {
  /**
   * @param {AccountName} account1
   * @param {AccountName} account2
   * @param {Money} amount
   * @param {Subject} subject
   * @param {Notes} notes
   * @param {TransactionTime} transactionTime
   * @param {Tag[]} tags
   */
  constructor (account1, account2, amount, subject, notes, transactionTime, tags = []) {
    this.account1 = account1
    this.account2 = account2
    this.amount = amount
    this.subject = subject
    this.notes = notes
    this.transactionTime = transactionTime
    this.tags = tags
  }
}

module.exports = Transaction
