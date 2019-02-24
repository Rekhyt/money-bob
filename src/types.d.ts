declare class AccountMetadata {
    BankAccount: AccountMetadataBankAccount
    CreditCard: AccountMetadataCreditCard
    Paypal: AccountMetadataPaypal
    Debit: AccountMetadataDebit
    Liability: AccountMetadataLiability
}

declare class AccountMetadataBankAccount {
    institute: string
    iban: string
    bic: string
}

declare class AccountMetadataCreditCard {
    institute: string
    type: string
    holder: string
    number: string
}

declare class AccountMetadataPaypal {
    emailAddress: string
}

declare class AccountMetadataDebit {
    debitorName: string
}

declare class AccountMetadataLiability {
    debitorName: string
}

declare class AccountReadModel {
    name: string
    parent: string
    type: string
    metadata: object
    tags: string[]
}

declare class TreeListAccountReadModel {
    name: string
    tags: string[]
    children: string[]
    parent: string
}

declare class TreeAccountReadModel {
    name: string
    tags: string[]
    children: TreeAccountReadModel[]
}