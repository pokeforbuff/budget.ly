import {AccountFactory} from "../data/factories/accounts.ts";

import express from 'express';
const router = express.Router();
import {TransactionFactory} from "../data/factories/transactions.ts";
import {SQLite} from "../utils/database_socket.ts";

/* GET home page. */
router.get('/', function(req, res, next) {
  return new Promise((resolve, reject) => {
    SQLite.open().then(() => {
      AccountFactory.initialise_accounts().then(() => {
        let accounts = AccountFactory.get_all_accounts()
        AccountFactory.initialise_merchants().then(() => {
          let merchants = AccountFactory.get_all_merchants()
          TransactionFactory.initialise_transactions().then(() => {
            let transactions = TransactionFactory.get_all_transactions()
            TransactionFactory.initialise_transaction_groups().then(() => {
              let transaction_groups = TransactionFactory.get_all_transaction_groups()
              SQLite.close().then(() => {
                res.status(200).json({
                  accounts: accounts,
                  merchants: merchants,
                  transactions: transactions,
                  transaction_groups: transaction_groups
                })
                resolve();
              }).catch((err) => {
                console.log(err)
                res.status(500).json({error: err.message})
                resolve();
              })
            }).catch((err) => {
              console.log(err)
              res.status(500).json({error: err.message})
              resolve();
            })
          }).catch((err) => {
            console.log(err)
            res.status(500).json({error: err.message})
            resolve();
          })
        }).catch((err) => {
          console.log(err)
          res.status(500).json({error: err.message})
          resolve();
        })
      }).catch((err) => {
        console.log(err)
        res.status(500).json({error: err.message})
        resolve();
      })
    }).catch((err) => {
      console.log(err)
      res.status(500).json({error: err.message})
      resolve();
    })
  })
});

export default router;
