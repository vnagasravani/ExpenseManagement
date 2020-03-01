const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

let  ExpenseModel = new Schema({

    expenseId:{
        type:String,
        unique:true
    },
    expenseName:{
        type:String,
        default:''
    },
    groupId:{
        type:String,
        default:''
    },
    groupName:{
        type:String,
        default:''
    },
    amount:{
        type:String,
        default:''
    },
    whoPaid:{
      type:  {
           id:String,
           name:String
        }
    },
    people:{
       type:[{
        id:String,
        name:String 
       }],
       default:[]
    },
     createdOn:{
        type:Date,
        default:Date.now()
    }
});

mongoose.model('ExpenseModel',ExpenseModel);




