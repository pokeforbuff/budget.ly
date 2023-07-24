// @ts-ignore
import {Account, AccountCategory, AccountType, AccountSchemaType, MerchantSchemaType} from "../../src/Account/model.ts";
// @ts-ignore
import {BrokerageAccount, CheckingAccount, CreditCard, Loan, Merchant, RetirementAccount, SavingsAccount} from "../../src/Account/index.ts";
// @ts-ignore
import {SQLite} from "../../utils/database_socket.ts";
// @ts-ignore
import {generate_unique_id} from "../../utils/id_generator.ts";


export class AccountFactory {
    private static accounts: { [account_id: string]: Account } = {};
    private static merchants: { [merchant_id: string]: Merchant } = {};
    private static accounts_table = "accounts"
    private static merchants_table = "merchants"

    static initialise_accounts() {
        return new Promise<void>((resolve, reject) => {
            let account_schema = {
                "id": [SQLite.modifiers.STRING, SQLite.modifiers.PRIMARY_KEY],
                "name": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL, SQLite.modifiers.UNIQUE],
                "category": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "type": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
                "balance": [SQLite.modifiers.REAL, SQLite.modifiers.NOT_NULL],
                "institution": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL],
            }
            let create_query = SQLite.build_create_query(AccountFactory.accounts_table, account_schema)
            let select_query = SQLite.build_select_query(AccountFactory.accounts_table, {}, {})
            SQLite.run(create_query).then(() => {
                SQLite.query_all(select_query).then((rows: object[]) => {
                    for (let row of rows) {
                        AccountFactory.add_account(row as AccountSchemaType)
                    }
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        });
    }

    static initialise_merchants() {
        return new Promise<void>((resolve, reject) => {
            let merchant_schema = {
                "id": [SQLite.modifiers.STRING, SQLite.modifiers.PRIMARY_KEY],
                "name": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL, SQLite.modifiers.UNIQUE],
                "goods_category": [SQLite.modifiers.STRING, SQLite.modifiers.NOT_NULL]
            }
            let create_query = SQLite.build_create_query(AccountFactory.merchants_table, merchant_schema)
            let select_query = SQLite.build_select_query(AccountFactory.merchants_table, {}, {})
            SQLite.run(create_query).then(() => {
                SQLite.query_all(select_query).then((rows: object[]) => {
                    for (let row of rows) {
                        AccountFactory.add_merchant(row as MerchantSchemaType)
                    }
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }).catch((error: Error) => {
                reject(error)
            })
        });
    }

    static get_all_accounts(): Array<AccountSchemaType> {
        let accounts = []
        for (let account of Object.values(AccountFactory.accounts)) {
            accounts.push(account.toObject() as AccountSchemaType)
        }
        return accounts
    }

    static get_all_merchants(): Array<MerchantSchemaType> {
        let merchants = []
        for (let merchant of Object.values(AccountFactory.merchants)) {
            merchants.push(merchant.toObject() as MerchantSchemaType)
        }
        return merchants
    }

    static get_account_from_id(account_id: string): Account {
        return AccountFactory.accounts[account_id]
    }

    static get_merchant_from_id(merchant_id: string): Merchant {
        return AccountFactory.merchants[merchant_id]
    }

    static get_account_type_from_id(account_id: string): AccountType {
        return AccountFactory.accounts[account_id].type
    }

    static get_account_category_from_id(account_id: string): AccountCategory | string {
        return AccountFactory.accounts[account_id].category
    }

    static get_merchant_goods_category_from_id(merchant_id: string): string {
        return AccountFactory.merchants[merchant_id].goods_category
    }

    static create_account(
        category: AccountCategory | string,
        type: AccountType,
        name: string,
        institution: string,
        balance: number
    ) {
        return new Promise<string>((resolve, reject) => {
            let account_id = generate_unique_id('a')
            let account_schema: AccountSchemaType = {
                "id": account_id,
                "name": name,
                "category": category,
                "type": type,
                "balance": balance,
                "institution": institution,
            }
            let insert_query = SQLite.build_insert_query(AccountFactory.accounts_table, account_schema)
            SQLite.run(insert_query).then(() => {
                AccountFactory.add_account(account_schema)
                resolve(account_id)
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static create_merchant(name: string, goods_category: string) {
        return new Promise<string>((resolve, reject) => {
            let merchant_id = generate_unique_id('m')
            let merchant_schema: MerchantSchemaType = {
                "id": merchant_id,
                "name": name,
                "goods_category": goods_category
            }
            let insert_query = SQLite.build_insert_query(AccountFactory.merchants_table, merchant_schema)
            SQLite.run(insert_query).then(() => {
                AccountFactory.add_merchant(merchant_schema)
                resolve(merchant_id)
            }).catch((error: Error) => {
                reject(error)
            })
        })
    }

    static add_account(account_schema: AccountSchemaType) {
        let account: Account;
        switch (account_schema.category) {
            case AccountCategory.CREDIT:
                account = new CreditCard(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            case AccountCategory.LOAN:
                account = new Loan(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            case AccountCategory.BROKERAGE:
                account = new BrokerageAccount(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            case AccountCategory.RETIREMENT:
                account = new RetirementAccount(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            case AccountCategory.SAVINGS:
                account = new SavingsAccount(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            case AccountCategory.CHECKING:
                account = new CheckingAccount(
                    account_schema.id,
                    account_schema.name,
                    account_schema.balance,
                    account_schema.institution
                )
                break
            default:
                account = new Account(
                    account_schema.id,
                    account_schema.name,
                    account_schema.category,
                    account_schema.type,
                    account_schema.balance,
                    account_schema.institution
                )
                break
        }
        AccountFactory.accounts[account_schema.id] = account
    }

    private static add_merchant(merchant_schema: MerchantSchemaType) {
        AccountFactory.accounts[merchant_schema.id] = new Merchant(
            merchant_schema.id,
            merchant_schema.name,
            merchant_schema.goods_category
        )
    }

    static deposit_to_account(account_id: string, amount: number) {
        return new Promise<void>((resolve, reject) => {
            let account = AccountFactory.get_account_from_id(account_id)
            if (account.category === AccountCategory.MERCHANT) {
                resolve()
            } else {
                if (account.type === AccountType.ASSET) {
                    account.balance += amount
                }
                if (account.type === AccountType.LIABILITY) {
                    account.balance -= amount
                }
                let update_query = SQLite.build_update_query(
                    AccountFactory.accounts_table,
                    {
                        "balance": account.balance
                    },
                    {
                        "id": account_id
                    }
                )
                SQLite.run(update_query).then(() => {
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }
        })
    }

    static withdraw_from_account(account_id: string, amount: number) {
        return new Promise<void>((resolve, reject) => {
            let account = AccountFactory.get_account_from_id(account_id)
            if (account.category === AccountCategory.MERCHANT) {
                resolve()
            } else {
                if (account.type === AccountType.ASSET) {
                    account.balance -= amount
                }
                if (account.type === AccountType.LIABILITY) {
                    account.balance += amount
                }
                let update_query = SQLite.build_update_query(
                    AccountFactory.accounts_table,
                    {
                        "balance": account.balance
                    },
                    {
                        "id": account_id
                    }
                )
                SQLite.run(update_query).then(() => {
                    resolve()
                }).catch((error: Error) => {
                    reject(error)
                })
            }
        })
    }
}

