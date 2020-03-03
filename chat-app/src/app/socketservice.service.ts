import { Injectable } from '@angular/core';
import *  as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Observable, observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { User } from 'src/Interfaces/user';
import { AddGroupResponse } from 'src/Interfaces/AddGroupResponse';
import { ExpenseInfo } from 'src/Interfaces/ExpenseInfo';
import { ExpenseResponse } from 'src/Interfaces/ExpenseResponse';
import { Expenses } from 'src/Interfaces/Expenses';



@Injectable({
  providedIn: 'root'
})
export class SocketserviceService {
  private socket;

  constructor(public http: HttpClient) {
    this.socket = io('http://localhost:3000');
  }

  //events to be listened
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verify', function (data) {
        observer.next(data);
      })

    })

  }//end verify user event 


  public getOnlineUsersList = () => {
    return Observable.create((observer) => {
      this.socket.on('online-user-list', function (data) {
        observer.next(data);
      })

    })

  } // end getonlineuserslist

  public disconnectedSocket = () => {
    return Observable.create((observer) => {
      this.socket.on("disconnect", () => {
        observer.next();
      }); // end Socket
    }); // end Observable
  }

  // public addGroupi = ()=>{
  //   this.socket.on('add-groupi',(data)=>{
  //     if(data.userId===Cookie.get('userId'))
  //     {

  //       this.socket.emit('add',data.groupName);
  //     }
  //   })
  // }//end addgroupi

  public addGroupResponse = () => {
    return new Promise<AddGroupResponse>((resolve, reject) => {
      this.socket.on('add-group-response', (data) => {
        resolve(data);
      }); // end Socket
    }); // end Observable
  }//end add group response

  public searchedResult = () => {
    return new Promise<Array<User>>((resolve, reject) => {
      this.socket.on('searched-result', (data) => {
        console.log('socket service', data);
        resolve(data);
      }); // end Socket
    });
  }//end searched result

public getExpenesResponse = ()=>{
  return new Promise<Expenses>((resolve, reject) => {
    this.socket.on('get-expenses-response', (data) => {
      console.log('socket service', data);
      resolve(data);
    }); // end Socket
  });
}//end getExpenesResponse

  public expenseResponse = () => {
    return new Promise<ExpenseResponse>((resolve, reject) => {
      this.socket.on('expense-response', (data) => {
        console.log('socket service', data);
        resolve(data);
      }); // end Socket
    });
  }//end expenseResponse

  public expenseDelResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('delexp-ack', function (data) {
        observer.next(data);
      })

    })
  }//end searched result


  public editAmountResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('edit-amount-ack', function (data) {
        observer.next(data);
      })

    })

  }  //end edit amount response

  public removePeopleResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('delete-people-ack', function (data) {
        console.log('delete people response',data);
        observer.next(data);
      })

    })

  }  //end removePeopleResponse


  public editWhoPaidResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('edit-whopaid-ack', function (data) {
        observer.next(data);
      })

    })

  }  //end edit whopaid response

  public editPeopleResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('edit-people-ack', function (data) {
        observer.next(data);
      })

    })

  }  //edit people response


  public errOccured = () => {
    return Observable.create((observer) => {
      this.socket.on('error-occurred', function (data) {
        observer.next(data);
      })

    })

  }  // end err occured event 



  //events to be emitted
  public setuser = (authToken) => {
    this.socket.emit('set-user', authToken);
  }//end set user

  public getExpenses = (groupName,pageValue,limit)=>{
    this.socket.emit('get-expenses',{
      groupName:groupName,
      skip:pageValue,
      limit:limit
    })
  }

  public delExpense = (expenseId) => {
    console.log('delExpense socket is emiitted');
    this.socket.emit(`delete-an-expense`, {
      userName: Cookie.get('userName'),
      userId: Cookie.get('userId'),
      expenseId: expenseId
    });
  }//end delexpense

  public editAmount = (expenseId, amount) => {
    this.socket.emit('edit-amount', {
      userName: Cookie.get('userName'),
      userId: Cookie.get('userId'),
      expenseId: expenseId,
      amount: amount
    })
  }//end editAmount

  public editPeople = (expenseId, people) => {
    this.socket.emit('edit-people', {
      userName: Cookie.get('userName'),
      userId: Cookie.get('userId'),
      expenseId: expenseId,
      people: people
    })
  }//end editpeople


  public editWhoPaid = (expenseId, whoPaid) => {

    this.socket.emit('edit-whopaid', {
      userName: Cookie.get('userName'),
      userId: Cookie.get('userId'),
      expenseId: expenseId,
      whoPaid: whoPaid
    })
  }//end editWhoPaid

  public removePeople = (expenseId, people,users) => {

    this.socket.emit('delete-people', {
      userName: Cookie.get('userName'),
      userId: Cookie.get('userId'),
      expenseId: expenseId,
      people: people,
      users:users
    })
  }//end removePeople

  public addPeople = (userId, groupName, groupId, groupGenerationTime) => {
    console.log('add pepople emit function is called')
    this.socket.emit('add-group', { userId: userId, groupName: groupName, groupId: groupId, groupGenerationTime: groupGenerationTime });
  }//end addpeople 

  public searchPeople = (name) => {
    this.socket.emit('search-user', name);
  }//end search people


  public addExpense = (expenseInfo) => {
    console.log('addExpense is called');
    this.socket.emit('create-expense', expenseInfo);
  }

  public exitSocket = () => {
    this.socket.disconnect();
  }// end exit socket


}
