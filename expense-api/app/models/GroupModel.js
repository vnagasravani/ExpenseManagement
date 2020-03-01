const  mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupModel = new Schema({
    groupId:{
        type:String
    },
    groupName :{
        type:String
    },
    description:{
        type:String
    },
    groupMembers:{
        type:[{
            userId:String,
            userName:String,
            email:String,
            mobileNumber:String
        }],
        default:[]
    },
    groupGenerationTime:{
        type:Date,
        default:Date.now()
    },
    createdBy : {
        type:{
           userId:String,
           userName:String
        }
    }
});

mongoose.model('GroupModel',GroupModel);