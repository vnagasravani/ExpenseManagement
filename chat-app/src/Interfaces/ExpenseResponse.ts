import {ExpenseInfo} from './ExpenseInfo'
export interface ExpenseResponse {
    error: Boolean,
    status: Number,
    message: String,
    data: ExpenseInfo   
}