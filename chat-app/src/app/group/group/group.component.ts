import { Component, OnInit } from '@angular/core';
//import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppServiceService } from 'src/app/app-service.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketserviceService } from 'src/app/socketservice.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  public groupName = '';
  public pageValue = 0;
  public limit = 6;
  public disconnectedSocket: boolean;
  public groupDetails;
  public groupMembers = [];
  public checkedUsers = [];
  public expenseId;
  public expenses = [];
  public expense ;
  public peopleNotInvolve = [];
  public filteredPayors = [];
  public removingPeople = [];
  public expenseInfo = {
    expenseName: '',
    amount: '',
    whoPaid: {
      id: String,
      name: String
    },
    people: [{
      id: String,
      name: String
    }],
    userId: '',
    userName: '',
    groupId: '',
    groupName: ''
  };


  constructor(private route: ActivatedRoute, private appService: AppServiceService, private SocketService: SocketserviceService, private router: Router, private toaster: ToastrService) { }

  ngOnInit() {
    this.checkStatus();

    this.verifyUserConfirmation();

    this.groupName = this.route.snapshot.paramMap.get('groupName');
    this.getGroupInfo(this.groupName);
    this.getExpenses();
    this.delExpenseResponse();
    this.editAmountResponse();
    this.editPeopleResponse();
    this.editWhoPaidResponse();
    this.deletePeopleResponse();
  }

  public getExpenseId = (expenseId) => {
    this.expenseId = expenseId;
    console.log('expenseId', this.expenseId);
  }

  public getExpenseById = (expenseId) => {
    this.expenseId = expenseId;
    let filterExpense = this.expenses.find(expense => expense.expenseId === expenseId);
    this.expense = filterExpense;
    console.log('getExpenseById',this.expense);

  }

  public getExpensepeopleToRemove = (expenseId)=>{
    this.expenseId = expenseId;
    let filterExpense = this.expenses.find(expense => expense.expenseId === expenseId);
    this.removingPeople = filterExpense.people;
    console.log(filterExpense),
    console.log(this.removingPeople);

  }
 
  public filterPayors=(expenseId)=>{
    this.expenseId=expenseId;
    let filterExpense = this.expenses.find(expense => expense.expenseId === expenseId);
    console.log('expense id',this.expenseId , expenseId)
    console.log('filtered expense',filterExpense);
    this.filteredPayors = filterExpense.people;

  }

  public filterPeople = (expenseId) => {
    this.peopleNotInvolve = [];
    this.expenseId = expenseId;
    let filterExpense = this.expenses.find(expense => expense.expenseId === expenseId);
    console.log('people in group', this.groupMembers);
    console.log('expense people before adding people ', filterExpense.people)
    for (let i = 0; i < this.groupMembers.length; i++) {
      if (filterExpense.people.findIndex(peoplei => peoplei.id === this.groupMembers[i].userId) == -1) {
        this.peopleNotInvolve.push(this.groupMembers[i]);
      }
    }
    console.log('filtered peoople to show while adding people ', this.peopleNotInvolve);
  }
  public checkStatus: any = () => {

    if (Cookie.get('AuthToken') === undefined || Cookie.get('AuthToken') === '' || Cookie.get('AuthToken') === null) {

      this.router.navigate(['/']);

      return false;

    } else {

      return true;

    }

  } // end checkStatus



  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false;

        this.SocketService.setuser(Cookie.get('AuthToken'));

      });
  }


  public getGroupInfo = (groupName) => {
    this.appService.getGroupDetails(groupName).subscribe(
      (data) => {
        this.groupDetails = data.data;
        this.groupMembers = data.data.groupMembers;
        console.log(this.groupDetails);
        console.log(this.groupMembers);
        console.log(this.groupDetails.groupId)
      },
      (err) => {
        console.log(err);
      }
    )
  }//end getgroupInfo

  public createExpense = () => {
    this.expenseInfo.userId = Cookie.get('userId');
    this.expenseInfo.userName = Cookie.get('userName');
    this.expenseInfo.groupId = this.groupDetails.groupId;
    this.expenseInfo.groupName = this.groupDetails.groupName;
    console.log(this.expenseInfo);
    this.SocketService.addExpense(this.expenseInfo);
    this.SocketService.expenseResponse().then((data) => {
      if (data.status == 200) {
        this.expenses.push(data.data);
        console.log(data);
        this.toaster.success('expense created successfully');


      }
      else {
        this.toaster.error('failed to create expense');
      }


    });
  }
  public getExpenses = () => {
    this.appService.getExpenses(this.pageValue, this.limit, this.groupName).subscribe(
      (data) => {
        if (data.status == 200) {
          this.expenses = data.data;
          console.log('get expenses is called',this.expenses);
        }
      },
      (err) => {
        console.log(err);
      })
  }//end getExpenses

  public editAmount = (amount) => {
    console.log(amount);
    this.SocketService.editAmount(this.expenseId, amount);
  }//end editAmount

  public delExpense = (expenseId) => {
    console.log(expenseId);
    this.SocketService.delExpense(expenseId);
  }//end delExpense

  public editPeople = (formData) => {
    this.SocketService.editPeople(this.expenseId, formData.people);
  }//end editpeople

  public removePeople = (formData)=>{
    console.log(formData.people)
    this.SocketService.removePeople(this.expenseId,formData.people)
  }
  
  public editWhoPaid =(formData)=>{
    console.log(formData.payor);
    this.SocketService.editWhoPaid(this.expenseId,formData.payor);
  }//end editWhoPaid

  public delExpenseResponse = () => {
    this.SocketService.expenseDelResponse().subscribe(
      (data) => {
        if (data.status == 200) {
          this.toaster.success('expense deleted successfully');
          for (let i = 0; i < this.expenses.length; i++) {
            if (this.expenses[i].expenseId == data.data.expenseId) {
              this.expenses.splice(i, 1);
            }
          }
          console.log(this.expenses);
        }
        else {
          this.toaster.error('failed to delete expense');
        }
      },
      (err) => {
        console.log(err);
      })
  }//end delExpenseResponse

  public editAmountResponse = () => {
    this.SocketService.editAmountResponse().subscribe(
      (data) => {
        console.log('edit amount response is called');
        if (data.status == 200) {
          this.toaster.success('expense amount edited successfully');
          for (let i = 0; i < this.expenses.length; i++) {
            if (this.expenses[i].expenseId == data.data.expenseId) {
              this.expenses[i].amount = data.data.amount
            }
          }
          console.log(this.expenses);
        }
        else {
          this.toaster.error('failed to edit amount in expense');
        }

      },
      (err) => {
        console.log(err);
      }
    )
  }//end editAmount response

  public editPeopleResponse = () => {
    this.SocketService.editPeopleResponse().subscribe(
      (data) => {
        if (data.status == 200) {
          this.toaster.success('people added successfully');
          for (let i = 0; i < this.expenses.length; i++) {
            if (this.expenses[i].expenseId == data.data.expenseId) {
              this.expenses[i].people = [];
              for (let j = 0; j < data.data.people.length; j++)
                this.expenses[i].people.push(data.data.people[j]);
              console.log('people in expense after adding ', this.expenses[i]);

            }

          }
          this.filterPeople(data.data.expenseId);

        }
        else {
          this.toaster.error('failed to add people to group');
        }
      },
      (err) => {
        console.log(err);
      }
    )
  }//end edit people response

  public deletePeopleResponse = () => {
    this.SocketService.removePeopleResponse().subscribe(
      (data) => {
        if (data.status == 200) {
          this.toaster.success('people deleted successfully');
          for (let i = 0; i < this.expenses.length; i++) {
            if (this.expenses[i].expenseId == data.data.expenseId) {
              this.expenses[i].people = [];
              for (let j = 0; j < data.data.people.length; j++)
                this.expenses[i].people.push(data.data.people[j]);
              console.log('people in expense after adding ', this.expenses[i]);

            }

          }
          this.getExpensepeopleToRemove (data.data.expenseId);

        }
        else {
          this.toaster.error('failed to delete people from group');
        }
      },
      (err) => {
        console.log(err);
      }
    )
  }//end edit people response


  public editWhoPaidResponse = ()=>{
    this.SocketService.editWhoPaidResponse().subscribe(
      (data)=>{
        if(data.status==200)
        {
          this.toaster.success('payor edited successfully');
          let index = this.expenses.findIndex(expense => expense.expenseId === data.data.expenseId);
          this.expenses[index] = data.data;
          console.log(data.data);
          console.log(this.expenses[index]);

        }
        else{
          this.toaster.error('failed to update payor');
        }
      }
    )
  }


}
