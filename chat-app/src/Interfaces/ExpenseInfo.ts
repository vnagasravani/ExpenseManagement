export interface ExpenseInfo {
  expenseId:String,
    expenseName:String,
    groupId:String,
    groupName:String,
      amount:String,
      whoPaid:{
        id:String,
        name:String
      },
      people:[{
        id:String,
        name:String
      }],
      createdOn:String   

}