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


let userModel = mongoose.model('UserModel');
let groupModel = mongoose.model('GroupModel');
let expenseModel = mongoose.model('ExpenseModel');
let expenseHistoryModel = mongoose.model('ExpenseHistoryModel');

let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('');
    let onlineUserList = [];
    myIo.on('connection', (socket) => {


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
                    onlineUserList.push(user);

                    socket.emit('online-user-list', onlineUserList);

                    console.log('online list' + onlineUserList);


                }

            })

        })//end set-user



        socket.on('search-user', (userName) => {

            userModel.find({ firstName: { $regex: userName } }, (err, result) => {
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

        socket.on('add-group', (data) => {

            socket.broadcast.emit('add-groupi', data);

        });//end add-group socket


        socket.on('add', (groupName) => {
            //adding a user to a group usig socket
            socket.join(groupName);
            console.group('while on' + socket.userId)
            let addGroupToUser = (groupName) => {
                return new Promise((resolve, reject) => {
                    userModel.updateOne({ userId: socket.userId }, { $push: { groupsList: groupName } })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update user while creating group');
                                let apiResponse = response.generate(true, 'failed to update user while creating group', 500, null);
                                reject(apiresponse);
                            }
                            if (result) {
                                logger.info(result);
                                resolve(groupName);
                            }
                        })

                })
            } //end add grouptouser

            let addUserTOGroup = (groupName) => {
                logger.info('adding user to group' + groupName);
                return new Promise((resolve, reject) => {
                    groupModel.findOneAndUpdate({ groupName: groupName }, { $push: { groupMembers: socket.userId } }, { new: true })
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

            addGroupToUser(groupName)
                .then(addUserTOGroup)
                .then((data) => {
                    // let apiResponse = response.generate(false, 'group members added successfully', 200, data);
                    //logger.info(apiresponse);
                    logger.info(data);
                    socket.emit('add-group-response', data);

                }).catch((err) => {
                    socket.emit('add-group-response', err);

                });

        });//end add socket

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

            addExpenseToHistory(details)
                .then(delExpense)
                .then(data => {
                    socket.broadcast.emit('delexp-ack', data);
                }).catch((err) => {
                    socket.broadcast.emit('delexp-ack', err);
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

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then((data) => {
                    console.log(data);
                    socket.broadcast.emit('edit-amount-ack', data);
                }).catch((err) => {
                    socket.broadcast.emit('edit-amount-ack', err);
                });


        });//end edit-amount socket 

         socket.on('edit-whopaid',(details)=>{

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
                                console.log(result);
                                resolve(result);
                            }
                        })
                })
            }//end getExpense


            let addExpenseToHistory = (expenseDetails) => {
                return new Promise((resolve, reject) => {
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'edited the whpoaid', oldValue: expenseDetails.whoPaid, newValue: details.whoPaid } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while adding edit whopaid expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while adding edit whopaid expense history', 500, null);
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
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { whopaid: details.whoPaid }, { new: true })
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

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then((data) => {
                    console.log(data);
                    socket.broadcast.emit('edit-whopaid-ack', data);
                }).catch((err) => {
                    socket.broadcast.emit('edit-whopaid-ack', err);
                });

         });//end edit-whopaid socket


         socket.on('edit-people',(details)=>{
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
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId },{$push: { people:{$each: details.people} }}, { new: true })
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

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then((data) => {
                    console.log(data);
                    socket.broadcast.emit('edit-people-ack', data);
                }).catch((err) => {
                    socket.broadcast.emit('edit-people-ack', err);
                });


         });//end edit-people socket;


        socket.on('delete-people',(details)=>{
            let getExpense = (details) => {
                return new Promise((resolve, reject) => {
                    expenseModel.findOne({ expenseId: details.expenseId })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('not able to retrive expense while delete people');
                                let apiResponse = response.generate(false, 'not able to retrive expense while delete people', 500, null)
                                reject(apiResponse);
                            }
                            else if (checkLib.isEmpty(result)) {
                                logger.info('expense not found while delete people');
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
                    expenseHistoryModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId }, { $push: { expenseHistory: { userId: details.userId, userName: details.userName, action: 'deleted people', newPeople: details.people } } }, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info('failed to update expensehistory while add delete people in  expense history');
                                let apiResponse = response.generate(true, 'failed to update expensehistory while delete people to expense history', 500, null);
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
                    expenseModel.findOneAndUpdate({ expenseId: expenseDetails.expenseId },{$pullAll: { people: details.people }}, { new: true })
                        .exec((err, result) => {
                            if (err) {
                                logger.info(err);
                                let apiResponse = response.generate(true, 'failed to update user while deleting people from expense', 500, null);
                                reject(err);
                            }
                            if (result) {
                                logger.info(result);
                                let apiResponse = response.generate(false, 'people deleted successfully ', 200, result);
                                resolve(apiResponse);
                            }

                        })

                })

            }//end edit expense

            getExpense(details)
                .then(addExpenseToHistory)
                .then(editExpense)
                .then((data) => {
                    console.log(data);
                    socket.broadcast.emit('delete-people-ack', data);
                }).catch((err) => {
                    socket.broadcast.emit('delete-people-ack', err);
                });


        });//end remove people socket 
         


        socket.on('send-mail', data => {
            let emailOptions = {
                from: 'racahanapujari25@gmail.com',
                to: data.email,
                subject: 'notification',
                html: `<p>Hi ${data.userName}</p> <br> <p>${data.data.message} </p>`
            }
            emailLib.sendEmail(emailOptions);
        })

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