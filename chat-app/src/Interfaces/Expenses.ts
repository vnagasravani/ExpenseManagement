import {ExpenseInfo} from './ExpenseInfo'
export interface Expenses {
    error: Boolean,
    status: Number,
    message: String,
    data: [ExpenseInfo]   
}