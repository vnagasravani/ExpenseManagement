const  mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExpenseHistoryModel = new Schema({
    expenseId:{
        type:String
    },
    expenseHistory:{
        type:[{
            userId:{
                type:String
            },
            userName:{
                type:String
            },
            action:{
                type:String
            },
            oldValue:{
                type:String
            },
            newValue:{
                type:String
            },
            newPeople:{
                type:Array
            },
            modifiedTime:{
                type:Date,
                 default:Date.now()
            }
        }],
        default:[]
    },
    createdTime:{
        type:Date,
        default:Date.now()
    }
});

mongoose.model('ExpenseHistoryModel',ExpenseHistoryModel);