const  mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupModel = new Schema({
    groupId:{
        type:String
    },
    groupName :{
        type:String
    },
    groupMembers:{
        type:Array,
        default:[]
    },
    groupGenerationTime:{
        type:Date,
        default:Date.now()
    }
});

mongoose.model('GroupModel',GroupModel);