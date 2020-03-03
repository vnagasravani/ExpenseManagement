const socketio = require('socket.io');
const mongoose = require('mongoose');
const usermodel = require('./../models/UserModel');
const groupmodel = require('./../models/GroupModel');
const exphistory = require('./../models/ExpenseHistoryModel');
const expense = require('./../models/ExpenseModel')
logger = require('pino')();
const events = require('events');
const tokenLib = require('./../libs/tokenLib');
const checkLib = require('./../libs/checkLib');
const response = require('./../libs/responseLib');
const emailLib = require('./../libs/emailLib');
const eventEmitter = new events.EventEmitter();
const shortid = require('shortid');
const time = require('./../libs/timeLib');


let userModel = mongoose.model('UserModel');
let groupModel = mongoose.model('GroupModel');
let expenseModel = mongoose.model('ExpenseModel');
let expenseHistoryModel = mongoose.model('ExpenseHistoryModel');

let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('');
    let onlineUserList = [];
    
    myIo.on('connection', (socket) => {
        let groupList = [{
            groupId:String,
               groupName:String,
               groupGenerationTime:Date
        }];
        socket.emit("verify", '');
        socket.on('set-user', function (authToken) {
            tokenLib.verifyClaimWithOutSecret(authToken, (err, decoded) => {
                if (err) {
                    socket.emit('auth-error', { status: 404, error: 'please provide auth token' });
                }
                else {
                    let currentUser = decoded.data;
                    socket.userId = currentUser.userId;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log('user verified');
                    console.log(currentUser);
                    let user = {
                        userId: currentUser.userId,
                        fullName: fullName
                    };
                    console.log('online user',user);
                    onlineUserList.push(user);

                    socket.emit('online-user-list', onlineUserList);
                    console.log('online list' + onlineUserList);

                    userModel.findOne({ userId: decoded.data.userId }, (err, result) => {
                        if (result) {
                        
                            groupList = result.groupsList;
                            for (let group of groupList) {
                                socket.join(group.groupId);
                                console.log('groupsList joining into room',group.groupId);
                            }
                        
                        }
                        if(err)
                        {
                            console.log('failed to retrive user while ading user to groups');
                        }
                    });

                    

                    

                }
            })
        })//end set-user

        socket.on('get-expenses',data=>{
            expenseModel.find({groupName:data.groupName})
        .select(' -__v -_id')
        .skip(data.skip * 6)
        .lean()
        .limit(data.limit)
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.info( 'Expense Controller: err in getAllexpenses '+err);
                let apiResponse = response.generate(true, 'Failed To Find Expenses', 500, null);
                socket.emit('get-expenses-response',apiResponse);
            } else if (checkLib.isEmpty(result)) {
                logger.info( 'Expense Controller: getAllexpenses is not found')
                let apiResponse = response.generate(true, 'No Expense Found', 404, null)
                socket.emit('get-expenses-response',apiResponse);

            } else {
                let apiResponse = response.generate(false, 'All Expenses Found', 200, result)
                socket.emit('get-expenses-response',apiResponse);

            }
        })

        });

        socket.on('search-user', (userName) => {

            userModel.find({ firstName: { $regex: userName } })
                .select(' -__v -_id -password')
                .exec((err, result) => {
                    if (err) {
                        socket.emit('error-message', { status: 500, message: 'error occured while searching friend ' })
                    }
                    else if (checkLib.isEmpty(result)) {
                        socket.emit('searched-result', result)
                    }
                    else {
                        socket.emit('searched-result', result)
                    }
                })

        })//end serach result

        // socket.on('add-group', (data) => {

        //     socket.broadcast.emit('add-groupi', data);

        // });//end add-group socket


        socket.on('add-group', (data) => {
            //adding a user to a group usig socket
            //socket.join(groupName);
            //console.group('while on' + socket.userId)
            console.log('add-group is called');
            let addGroupToUser = (data) => {
                return new Promise((resolve, reject) => {
                    userModel.findOneAndUpdate({ userId: data.userId }, {
                        $push: {
                            groupsList: {
                                groupName: data.groupName,
                                groupId: data.groupId,
                                groupGenerationTime: data.groupGenerationTime
                            }
                        }
                    }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while creating group');
                                let apiResponse = response.generate(true, 'failed to update user while creating group', 500, null);
                                reject(apiresponse);
                            }
                            if (result) {

                                resolve(result);
                            }
                        })

                })
            } //end add grouptouser

            let addUserTOGroup = (userDetails) => {
                console.log('add user to group');
                console.log(userDetails)
                logger.info('adding user to group' + data.groupName);
                return new Promise((resolve, reject) => {
                    groupModel.findOneAndUpdate({ groupName: data.groupName }, {
                        $push: {
                            groupMembers: {
                                userId: userDetails.userId,
                                userName: userDetails.userName,
                                email: userDetails.email,
                                mobileNumber: userDetails.mobileNumber
                            }
                        }
                    }, { new: true })
                        .select(' -__v -_id -groupGenerationTime')
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while creating group');
                                // let apiResponse = response.generate(true, 'failed to update user while creating group', 500, null);
                                reject(err);
                            }
                            if (result) {
                                logger.info(result);
                                resolve(result);
                            }

                        })

                })

            } //end addUserTOGroup 

            addGroupToUser(data)
                .then(addUserTOGroup)
                .then((data) => {
                    let apiResponse = response.generate(false, ' member  added to group successfully', 200, data);
                    //logger.info(apiresponse);
                    logger.info(data);
                    socket.emit('add-group-response', apiResponse);

                }).catch((err) => {
                    socket.emit('add-group-response', err);

                });

        });//end add socket


        socket.on('create-expense', (expenseDetails) => {

            let createExpense = () => {
                logger.info('create expense');
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseName: expenseDetails.expenseName, groupName: expenseDetails.groupName })
                        .exec((err, retrivedDetails) => {
                            if (err) {
                                logger.info('failed to create expense')
                                let apiresponse = response.generate(true, 'failed to create expense', 500, null);
                                reject(apiresponse);
                            }

                            else {
                                if (checkLib.isEmpty(retrivedDetails)) {

                                    let expense = new expenseModel({
                                        expenseId: shortid.generate(),
                                        expenseName: expenseDetails.expenseName,
                                        groupId: expenseDetails.groupId,
                                        groupName: expenseDetails.groupName,
                                        amount: parseInt(expenseDetails.amount),
                                        whoPaid: {
                                            id: expenseDetails.whoPaid.id,
                                            name: expenseDetails.whoPaid.name
                                        },
                                        createdOn: time.getLocalTime()

                                    });

                                    expense.save((err, result) => {
                                        if (err) {
                                            let apiresponse = response.generate(true, 'failed to create expense', 500, null);
                                            reject(apiresponse);
                                        }
                                        else {
                                            let newExpenseObject = expense.toObject();
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

            let addPeople = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndUpdate({ expenseId: details.expenseId }, { $push: { people: { $each: expenseDetails.people } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('not able to update people while create expense');
                                let apiResponse = response.generate(false, 'not able to retrive expense while add people', 500, err)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                logger.info('expense not found while add people');
                                let apiResponse = response.generate(false, ' expense not found while add people', 500, null)
                                reject(apiResponse);
                            }
                            else {
                                console.log(result);
                                resolve(result);
                            }


                        });

                });
            }

            let addToExpenseHistory = (details) => {
                logger.info(expenseDetails);
                return new Promise((resolve, reject) => {

                    let exphistory = new expenseHistoryModel({
                        expenseId: details.expenseId,
                        expenseHistory: [{
                            userId: expenseDetails.userId,
                            userName: expenseDetails.userName,
                            action: 'create',
                            modifiedTime: details.createdOn
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
                            resolve(details);

                        }

                    });


                })
            }//end  addToExpenseHistory 

            createExpense(expenseDetails)
                .then(addPeople)
                .then(addToExpenseHistory)
                .then((expenseObject) => {
                    let apiresponse = response.generate(false, 'expensecreated', 200, expenseObject);
                    socket.emit('expense-response', apiresponse);
                }).catch((err) => {
                    socket.emit('expense-response', err);
                })
        });//end create expense socket

        socket.on('delete-an-expense', (details) => {
            logger.info('delete an expense socket is on');
            logger.info(details);
            let addExpenseToHistory = (details) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: details.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'delete' } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while adding expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while adding expense history', 500, null);
                                reject(apiResponse);
                            }
                            if (result) {
                                logger.info(result);
                                resolve(details);
                            }

                        })

                })

            } //end addexpenseToHistory

            let delExpense = () => {
                logger.info('delExpense');
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndRemove({ 'expenseId': details.expenseId }).exec((err, result) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'expenseController: deleteanexpense', 10)
                            let apiResponse = response.generate(true, 'Failed To delete expense', 500, null)
                            reject(apiResponse)
                        } else if (checkLib.isEmpty(result)) {
                            logger.info('No expense Found', 'expense Controller: deleteexpense')
                            let apiResponse = response.generate(true, 'No expense Found', 404, null)
                            reject(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Deleted the expense successfully', 200, result)
                            resolve(apiResponse);
                        }
                    });// end user model find and remove


                })
            } //end del expense  

            let sendEmails = (apiresponse)=>{
                return new Promise ((resolve,reject)=>{
                    groupModel.findOne({groupId:apiresponse.data.groupId},(err,result)=>{
                       
                         if (err) {
                             logger.info(err);
                             let apiResponse = response.generate(true, 'failed to send email to users while deleting people from expense', 500, null);
                             reject(err);
                         }
                         if (result) {
                             emailLib.sendMails(result,apiresponse);
                             resolve(apiresponse);
                         }
 
                       
                    })
                })
             }//end sendEmails

           

            addExpenseToHistory(details)
                .then(delExpense)
                .then(sendEmails)
                .then(data => {
                    myIo.in(data.data.groupId).emit('delexp-ack', data);
                    
                }).catch((err) => {
                    myIo.in(data.data.groupId).emit('delexp-ack', err);
                })

        });//end socket delete - an - expense

        socket.on('edit-amount', (details) => {
            let getExpense = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseId: details.expenseId })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('not able to retrive expense while edit amount');
                                let apiResponse = response.generate(false, 'not able to retrive expense while edit amount', 500, null)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                logger.info('expense not found while edit amount');
                                let apiResponse = response.generate(false, ' expense not found while edit amount', 500, null)
                                reject(apiResponse);
                            }
                            else {
                                console.log(result);
                                resolve(result);
                            }
                        })
                })
            }//end getExpense


            let addExpenseToHistory = (expenseDetails) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'edited the amount', oldValue: expenseDetails.amount.toString(), newValue: details.amount } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while adding edit amount expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while adding edit aamount expense history', 500, null);
                                reject(apiResponse);
                            }
                            if (result) {
                                logger.info(result);
                                resolve(expenseDetails);
                            }

                        })

                })

            } //end addexpenseToHistory

            let editExpense = (expenseDetails) => {
                console.log('edit expense function is called');
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { amount: parseInt(details.amount) }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while editing amount');
                                let apiResponse = response.generate(true, 'failed to update user while editing amount', 500, null);
                                reject(err);
                            }
                            if (result) {
                                logger.info(result);
                                let apiResponse = response.generate(false, 'amount updated successfully ', 200, result);
                                resolve(apiResponse);
                            }

                        })

                })

            }//end edit expense

            let sendEmails = (apiresponse)=>{
                return new Promise ((resolve,reject)=>{
                    groupModel.findOne({groupId:apiresponse.data.groupId},(err,result)=>{
                       
                         if (err) {
                             logger.info(err);
                             let apiResponse = response.generate(true, 'failed to update user while deleting people from expense', 500, null);
                             reject(err);
                         }
                         if (result) {
                             emailLib.sendMails(result,apiresponse);
                             resolve(apiresponse);
                         }
 
                       
                    })
                })
             }//end sendEmails

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then(sendEmails)
                .then((data) => {
                    console.log('edit amount',data);
                    myIo.in(data.data.groupId).emit('edit-amount-ack', data);

                    
                }).catch((err) => {
                    myIo.in(data.data.groupId).emit('edit-amount-ack', err);
                });


        });//end edit-amount socket 

        socket.on('edit-whopaid', (details) => {

           console.log('edit who paid is called',details);
            let getExpense = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseId: details.expenseId })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('not able to retrive expense while edit whopaid');
                                let apiResponse = response.generate(false, 'not able to retrive expense while edit whopaid', 500, null)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                logger.info('expense not found while edit whopaid');
                                let apiResponse = response.generate(false, ' expense not found while edit whopaid', 500, null)
                                reject(apiResponse);
                            }
                            else {
                                resolve(result);
                            }
                        })
                })
            }//end getExpense


            let addExpenseToHistory = (expenseDetails) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'edited the whpoaid', oldValue: expenseDetails.whoPaid.name, newValue: details.whoPaid.name } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while adding edit whopaid expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while adding edit whopaid expense history', 500, null);
                                reject(apiResponse);
                            }
                            if (result) {
                                console.log('expense history',result);
                                resolve(expenseDetails);
                            }

                        })

                })

            } //end addexpenseToHistory

            let editExpense = (expenseDetails) => {
                console.log('edit expense function is called');
                console.log(expenseDetails);
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, {whoPaid: {id:details.whoPaid.id,
                                                                                                        name:details.whoPaid.name
                    }}, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while editing whopaid');
                                let apiResponse = response.generate(true, 'failed to update user while editing whopaid', 500, null);
                                reject(err);
                            }
                            if (result) {
                                logger.info(result);
                                let apiResponse = response.generate(false, 'whopaid updated successfully ', 200, result);
                                resolve(apiResponse);
                            }

                        })

                })

            }//end edit expense

            let sendEmails = (apiresponse)=>{
                return new Promise ((resolve,reject)=>{
                    groupModel.findOne({groupId:apiresponse.data.groupId},(err,result)=>{
                       
                         if (err) {
                             logger.info(err);
                             let apiResponse = response.generate(true, 'failed to update user whpaid from expense', 500, null);
                             reject(err);
                         }
                         if (result) {
                             emailLib.sendMails(result,apiresponse);
                             resolve(apiresponse);
                         }
 
                       
                    })
                })
             }//end sendEmails


            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then(sendEmails)
                .then((data) => {
                    console.log(data);
                    myIo.in(data.data.groupId).emit('edit-whopaid-ack', data);
                }).catch((err) => {
                    myIo.in(data.data.groupId).emit('edit-whopaid-ack', err);

                });

        });//end edit-whopaid socket


        socket.on('edit-people', (details) => {
            let getExpense = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseId: details.expenseId })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('not able to retrive expense while edit people');
                                let apiResponse = response.generate(false, 'not able to retrive expense while edit people', 500, null)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                logger.info('expense not found while edit people');
                                let apiResponse = response.generate(false, ' expense not found while edit people', 500, null)
                                reject(apiResponse);
                            }
                            else {
                                console.log(result);
                                resolve(result);
                            }
                        })
                })
            }//end getExpense


            let addExpenseToHistory = (expenseDetails) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'added people', newPeople: details.people } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while adding edit people in  expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while adding people to expense history', 500, null);
                                reject(apiResponse);
                            }
                            if (result) {
                                logger.info(result);
                                resolve(expenseDetails);
                            }

                        })

                })

            } //end addexpenseToHistory

            let editExpense = (expenseDetails) => {
                console.log('edit expense function is called');
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { people: { $each: details.people } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while adding people to expense');
                                let apiResponse = response.generate(true, 'failed to update user while adding people to expense', 500, null);
                                reject(err);
                            }
                            if (result) {
                                logger.info(result);
                                let apiResponse = response.generate(false, 'people added successfully ', 200, result);
                                resolve(apiResponse);
                            }

                        })

                })

            }//end edit expense

            let sendEmails = (apiresponse)=>{
                return new Promise ((resolve,reject)=>{
                    groupModel.findOne({groupId:apiresponse.data.groupId},(err,result)=>{
                       
                         if (err) {
                             logger.info(err);
                             let apiResponse = response.generate(true, 'failed to update user while deleting people from expense', 500, null);
                             reject(err);
                         }
                         if (result) {
                             emailLib.sendMails(result,apiresponse);
                             resolve(apiresponse);
                         }
 
                       
                    })
                })
             }//end sendEmails



            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then(sendEmails)
                .then((data) => {
                    console.log(data);
                    myIo.in(data.data.groupId).emit('edit-people-ack', data);
                }).catch((err) => {
                    myIo.in(data.data.groupId).emit('edit-people-ack', err);
                });


        });//end edit-people socket;


        socket.on('delete-people', (details) => {
            console.log('delete people function is called',details);
            let getExpense = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseId: details.expenseId })
                        .exec((err, result) => {
                            if (err) {
                                console.log('not able to retrive expense while delete people');
                                let apiResponse = response.generate(false, 'not able to retrive expense while delete people', 500, null)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                console.log('expense not found while delete people');
                                let apiResponse = response.generate(false, ' expense not found while delete people', 500, null)
                                reject(apiResponse);
                            }
                            else {
                               console.log(result);
                                resolve(result);
                            }
                        })
                })
            }//end getExpense


            let addExpenseToHistory = (expenseDetails) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'deleted people',oldPeople :details.people } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while add delete people in  expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while delete people to expense history', 500, null);
                                reject(apiResponse);
                            }
                            if (result) {
                                console.log(result);
                                resolve(expenseDetails);
                            }

                        })

                })

            } //end addexpenseToHistory

            let editExpense = (expenseDetails) => {
                console.log('edit expense function is called');
                return new Promise((resolve, reject) => {
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $pull: { people: { id:{$in:details.users} } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info(err);
                                let apiResponse = response.generate(true, 'failed to update user while deleting people from expense', 500, null);
                                reject(err);
                            }
                            if (result) {
                               console.log(result);
                                let apiResponse = response.generate(false, 'people deleted successfully ', 200, result);
                                resolve(apiResponse);
                            }

                        })

                })

            }//end edit expense 

            let sendEmails = (apiresponse)=>{
               return new Promise ((resolve,reject)=>{
                   groupModel.findOne({groupId:apiresponse.data.groupId},(err,result)=>{
                      
                        if (err) {
                            logger.info(err);
                            let apiResponse = response.generate(true, 'failed to update user while deleting people from expense', 500, null);
                            reject(err);
                        }
                        if (result) {
                            emailLib.sendMails(result,apiresponse);
                            resolve(apiresponse);
                        }

                      
                   })
               })
            }//end sendEmails

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then(sendEmails)
                .then((data) => {
                    console.log(data.data.groupId);
                    myIo.in(data.data.groupId).emit('delete-people-ack', data);
                }).catch((err) => {
                    myIo.in(data.data.groupId).emit('delete-people-ack', data);
                });


        });//end remove people socket 


        // socket.on('send-mail', data => {
        //     let emailOptions = {
        //         from: 'racahanapujari25@gmail.com',
        //         to: data.email,
        //         subject: 'notification',
        //         html: `<p>Hi ${data.userName}</p> <br> <p>${data.data.message} </p>`
        //     }
        //     emailLib.sendEmail(emailOptions);
        // })//end send mail socket

        socket.on('disconnect', () => {
            console.log('user is disconnected');
            console.log(socket.userId);
            var removeIndex = onlineUserList.map(function (user) { return user.userId; }).indexOf(socket.userId);
            onlineUserList.splice(removeIndex, 1)
            console.log(onlineUserList);
        });  //end socket dissconnect event

        socket.emit('online-user-list', onlineUserList);


    }); //end socket connection 



}

module.exports = {
    setServer: setServer
}