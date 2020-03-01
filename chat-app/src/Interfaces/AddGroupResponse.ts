export interface AddGroupResponse {
    error: Boolean,
    status: Number,
    message: String,
    data: {
        groupId:String,
        groupName:String,
        groupMembers:Array<String>
    }    
}