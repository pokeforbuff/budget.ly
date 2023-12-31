import express from 'express';

const router = express.Router();
import {AccountFactory} from "../data/factories/accounts.ts";
import {AccountCategory, AccountType} from "../src/Account/model.ts";

/* GET home page. */
router.get('/', function (req, res, next) {
    return new Promise((resolve, reject) => {
        AccountFactory.create_account(
            req.body.category,
            req.body.type,
            req.body.name,
            req.body.institution,
            req.body.balance
        ).then((account_id) => {
            res.status(200).json({name: account_id})
            resolve();
        }).catch((err: Error) => {
            res.status(200).json({name: err.message})
            resolve();
        })
    })
});

export default router;
