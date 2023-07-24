// @ts-ignore
import {AccountCategory, Account, AccountType} from "./model.ts";

class CheckingAccount extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.CHECKING, AccountType.ASSET, balance, institution)
    }
}

class SavingsAccount extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.SAVINGS, AccountType.ASSET, balance, institution)
    }
}

class CreditCard extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.CREDIT, AccountType.LIABILITY, balance, institution)
    }
}

class BrokerageAccount extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.BROKERAGE, AccountType.ASSET, balance, institution)
    }
}

class RetirementAccount extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.RETIREMENT, AccountType.ASSET, balance, institution)
    }
}

class Loan extends Account {
    constructor(id: string, name: string, balance: number, institution: string) {
        super(id, name, AccountCategory.LOAN, AccountType.LIABILITY, balance, institution)
    }
}

class Merchant extends Account {
    goods_category: string;

    constructor(id: string, name: string, goods_category: string) {
        super(id, name, AccountCategory.MERCHANT, AccountType.LIABILITY)
        this.goods_category = goods_category
    }

    toObject(): object {
        return {
            id: super.id,
            name: super.name,
            category: this.goods_category
        }
    }
}

export {CheckingAccount, SavingsAccount, CreditCard, BrokerageAccount, RetirementAccount, Loan, Merchant}
