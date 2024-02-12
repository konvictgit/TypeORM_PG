import express from "express";
import {Transaction,TransactionType} from "../entities/Transaction";
import { Client } from "../entities/Client";


const router = express.Router();



router.post("/api/client/:clientId/transaction", async(req,res)=>{
    const {clientId} = req.params;
    const {type,amount} = req.body;
    const transactionAmount = parseFloat(amount);
    const client = await Client.findOne({ where: { id: parseInt(clientId) } });

    if (!client) {
        return res.json({
            msg:"client not found"
        })
    } 

    const transaction = Transaction.create({
        amount: transactionAmount,
        type,
        client
    });

    await transaction.save();

    if (type === TransactionType.DEPOSIT) {
        client.balance += transactionAmount;
    } else if (type === TransactionType.WITHDRAW) {
        if (amount > client.balance) {
            return res.json({
                msg: "Insufficient funds"
            });
        }
        client.balance -= transactionAmount;
    }
    
    // Save both transaction and client
    await Promise.all([transaction.save(), client.save()]);
    
    console.log("Raw amount:", amount);
    console.log("Parsed amount:", transactionAmount);
    console.log("Transaction type:", type);

    return res.json({
        msg: "Transaction successful",
        newBalance: client.balance
    });


})

export{router as createTransactionRouter}