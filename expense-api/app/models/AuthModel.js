const  mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthModel = new Schema({
    userId:{
        type:String
    },
    userName:{
     type:String,
     default:''
    },
    authToken :{
        type:String
    },
    tokenSecret:{
        type:String
    },
    email:{
        type:String
    },
    tokenGenerationTime:{
        type:Date,
        default:Date.now()
    }
});

mongoose.model('AuthModel',AuthModel);