export enum AccountCategory {
    CHECKING = "Checking",
    SAVINGS = "Savings",
    CREDIT = "Credit Card",
    BROKERAGE = "Brokerage",
    RETIREMENT = "Retirement",
    MERCHANT = "Merchant",
    LOAN = "Loan"
}

export enum AccountType {
    ASSET = 'Asset',
    LIABILITY = 'Liability'
}

export type AccountSchemaType = {
    id: string,
    name: string,
    category: AccountCategory | string,
    type: AccountType,
    balance: number,
    institution: string
}

export type MerchantSchemaType = {
    id: string,
    name: string,
    goods_category: string
}

export class Account {
    id: string;
    name: string;
    category: AccountCategory | string;
    type: AccountType;
    institution: string;
    balance: number;

    constructor(id: string, name: string, category: AccountCategory | string, type: AccountType, balance?: number, institution?: string) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.type = type
        this.balance = typeof balance === 'undefined' ? 0.0 : balance;
        this.institution = typeof institution === 'undefined' ? "N/A" : institution;
    }

    toObject(): object {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            type: this.type,
            balance: this.balance,
            institution: this.institution
        }
    }
}
