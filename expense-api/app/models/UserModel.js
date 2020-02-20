const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

let  UserModel = new Schema({

    userId:{
        type:String,
        unique:true
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    mobileNumber:{
        type:String,
        default:''
    },
    password:{
        type:String,
        default:''
    },
    recoveryPassword:{
       type:String
    },
     createdOn:{
        type:Date,
        default:Date.now()
    }
});

mongoose.model('UserModel',UserModel);




