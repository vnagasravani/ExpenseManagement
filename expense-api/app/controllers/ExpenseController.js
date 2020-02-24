const express = require('express');
const mongoose = require('mongoose');
const validation = require('./../libs/paramsValidationLib');
const response = require('./../libs/responseLib');
const check = require('./../libs/checkLib');
const tokenLib = require('./../libs/tokenLib');
const shortid = require('shortid');
const logger = require('pino')();
const time = require('./../libs/timeLib');



let groupModel = mongoose.model('GroupModel');
let userModel = mongoose.model('UserModel');
let expenseModel = mongoose.model('ExpenseModel');
let expenseHistoryModel = mongoose.model('ExpenseHistoryModel');

let getExpenseHistory = (req, res) => {
    expenseHistoryModel.findOne({ 'expenseId': req.params.expenseId})
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'expesne Controller: getSingleexpensehistory', 10)
                let apiResponse = response.generate(true, 'Failed To get expense history', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No expense history Found', 'expense Controller:getSinglegroup')
                let apiResponse = response.generate(true, 'No expense history  Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'expense history Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get expense history


let getSingleGroup = (req, res) => {
    groupModel.findOne({ 'groupName': req.params.groupName})
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'expesne Controller: getSinglegroup', 10)
                let apiResponse = response.generate(true, 'Failed To group Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No group Found', 'expense Controller:getSinglegroup')
                let apiResponse = response.generate(true, 'No group Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'group Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single group

let groupFormation = (req, res) => {


    let createGroup = (req, res) => {
        return new Promise((resolve, reject) => {
            groupModel.findOne({ groupName: req.body.groupName })
                .exec((err, retrivedDetails) => {
                    if (err) {
                        let apiresponse = response.generate(true, 'failed to create group', 500, null);
                        reject(apiresponse);
                    }

                    else {
                        if (check.isEmpty(retrivedDetails)) {

                            let group = new groupModel({
                                groupId: shortid.generate(),
                                groupName: req.body.groupName,
                                createdOn: time.getLocalTime()

                            });

                            group.save((err, result) => {
                                if (err) {
                                    let apiresponse = response.generate(true, err, 500, null);
                                    reject(apiresponse);
                                }
                                else {
                                    let newGroupObject = group.toObject();
                                    let apiresponse = response.generate(true, 'group created', 200, newGroupObject);
                                    resolve(newGroupObject);

                                }

                            });

                        }
                        else {
                            let apiresponse = response.generate(true, 'A group is already existed with same group name ', 500, null);
                            reject(apiresponse);
                        }
                    }

                })



        })

    }//end group created


    let addGroupToUser = (groupDetails) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ userId: req.body.userId }, { $push: { groupsList: groupDetails.groupName } })
                .exec((err, result) => {
                    if (err) {
                        logger.info('failed to update user while creating group');
                        let apiResponse = response.generate(true, 'failed to update user while creating group', 500, null);
                        reject(apiresponse);
                    }
                    if (result) {
                        logger.info(result);
                        resolve(groupDetails);
                    }
                })

        })
    } //end add grouptouser

    let addUserTOGroup = (groupDetails) => {
        logger.info('adding user to group' + groupDetails);
        return new Promise((resolve, reject) => {
            groupModel.updateOne({ groupId: groupDetails.groupId }, { $push: { groupMembers: req.body.userId } })
                .exec((err, result) => {
                    if (err) {
                        logger.info('failed to update user while creating group');
                        let apiResponse = response.generate(true, 'failed to update user while creating group', 500, null);
                        reject(apiresponse);
                    }
                    if (result) {
                        logger.info(result);
                        resolve(groupDetails);
                    }

                })

        })

    } //end addUserTOGroup 





    createGroup(req, res)
        .then(addGroupToUser)
        .then(addUserTOGroup)
        .then((data) => {
            let apiResponse = response.generate(false, 'group created successfully', 200, data);
            res.send(apiResponse);

        }).catch((err) => {
            res.send(err);
        });

} //end groupFormation 


let expenseCreation = (req, res) => {

let createExpense = (req,res)=>{
    logger.info('create expense');
    let people = req.body.people
    let array = people.split(',')
    return new Promise ((resolve,reject)=>{
        expenseModel.findOne({ expenseName: req.body.expenseName })
        .exec((err, retrivedDetails) => {
            if (err) {
                logger.info('failed to create expense')
                let apiresponse = response.generate(true, 'failed to create expense', 500, null);
                reject(apiresponse);
            }

            else {
                if (check.isEmpty(retrivedDetails)) {

                    let expense = new expenseModel({
                        expenseId: shortid.generate(),
                        expenseName: req.body.expenseName,
                        groupId: req.body.groupId,
                        amount: parseInt(req.body.amount),
                        whoPaid: req.body.whoPaid,
                        people:array,
                        createdOn: time.getLocalTime()

                    });

                    expense.save((err, result) => {
                        if (err) {
                            let apiresponse = response.generate(true, 'failed to create expense', 500, null);
                            reject(apiresponse);
                        }
                        else {
                            let newExpenseObject = expense.toObject();
                           // let apiresponse = response.generate(false, 'expensecreated', 200, newExpenseObject);
                            //res.send(apiresponse);
                            logger.info(newExpenseObject);
                            resolve(newExpenseObject);

                        }

                    });

                }
                else {
                    let apiresponse = response.generate(true, 'A expense is already existed with same expense name ', 500, null);
                    reject(apiresponse);
                }
            }

        })
    })
} //end create expense

let addToExpenseHistory = (expenseDetails)=>{
    logger.info(expenseDetails);
    return new Promise((resolve,reject)=>{

        let exphistory = new expenseHistoryModel({
            expenseId: expenseDetails.expenseId,
            expenseHistory:[{
                userId:req.body.userId,
                userName:req.body.userName,
                action:'create',
                modifiedTime:expenseDetails.createdOn
            }],
            createdOn: time.getLocalTime()

        });

        exphistory.save((err, result) => {
            if (err) {
                let apiresponse = response.generate(true, 'failed to create expensehistory', 500, null);
                reject(apiresponse);
            }
            else {
                logger.info(result);
                resolve(expenseDetails);

            }

        });


    })
}//end  addToExpenseHistory 

createExpense(req,res)
.then(addToExpenseHistory)
.then((expenseObject)=>{
    let apiresponse = response.generate(false, 'expensecreated', 200, expenseObject);
    res.send(apiresponse);
}).catch((err)=>{
    res.send(err);
})

    


} //end expensecreation 

let getAllExpenses = (req, res) => {
    const skip = parseInt(req.body.skip)
    expenseModel.find()
        .select(' -__v -_id')
        .skip(skip * 6)
        .lean()
        .limit(6)
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.info(err.message, 'Expense Controller: getAllexpenses', 10)
                let apiResponse = response.generate(true, 'Failed To Find Expenses', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info(err.message, 'Expense Controller: getAllexpenses', 10)
                let apiResponse = response.generate(true, 'No Expense Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Expenses Found', 200, result)
                res.send(apiResponse)
            }
        })
}//get all expenses


module.exports = {
    groupFormation: groupFormation,
    expenseCreation: expenseCreation,
    getAllExpenses: getAllExpenses,
    getSingleGroup:getSingleGroup,
    getExpenseHistory:getExpenseHistory

}

