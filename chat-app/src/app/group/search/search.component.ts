import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { NgxSpinnerService } from "ngx-spinner"
import { SocketserviceService } from 'src/app/socketservice.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { identifierModuleUrl } from '@angular/compiler';
import { transition, trigger, style, animate } from '@angular/animations';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  animations: [
    trigger('usersList', [
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100px)'
        }),
        animate(300)
      ]),
      transition('* => void', [
        animate(300, style({
          transform: 'translateX(100px)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class SearchComponent implements OnInit {
  public users = [];
  public searchedUsers = [];
  public groupMembers = [];
  public groupDetails ;
  public groupName ;
  public loading = true;
  public searchingValue = '';
  public pageValue = 0;
  public limit = 8;
  public Usercount;
  public searching = false;

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  constructor(private AppService: AppServiceService, private SocketService: SocketserviceService ,private route:ActivatedRoute,private toastr: ToastrService,private spinner:NgxSpinnerService) { }

  ngOnInit() {
    this.getUsers(this.pageValue, this.limit);
    this.groupName=this.route.snapshot.paramMap.get('groupName');
    this.getGroupMembers(this.groupName);
    this.spinner.show();
    
  }

  public search = (data) => {
    this.searching = true;
    this.searchingValue = this.searchInput.nativeElement.value + data.key;
    this.SocketService.searchPeople(this.searchingValue);
    this.searchResult();
  } //end search


  public searchResult = () => {
    this.SocketService.searchedResult().then(
      (data) => {
        this.searchedUsers = data;
        console.log(this.searchedUsers);
       }); 
  }//end searchresult

  public unsearch = ()=>{
   this.searchInput.nativeElement.value='';
   this.searchedUsers=[];
   this.searching = false;
  }//end unsearch

  public getUsers = (pageValue, limit) => {
    this.AppService.getAllUsers(pageValue, limit).subscribe(
      (data) => {
        if (data.status == 200) {
          this.loading = false;
          this.users = data.data.users;
          this.Usercount = data.data.userCount;
         }
      },
      (err) => {
        console.log(err);
        this.toastr.error('some error occured');
      });
  }//end getUsers

  public getGroupMembers = (groupName)=>{
    this.AppService.getGroupDetails(groupName).subscribe(
      (data)=>{
        if(data.status==200)
        {
          this.groupMembers = data.data.groupMembers;
          this.groupDetails = data.data;
        }
      },
      (err)=>{
         console.log(err);
         this.toastr.error('some error occured');
      });
  }//end get group members

  public add = (userId) =>{
    console.log('add function is called',this.groupName,userId);
    this.SocketService.addPeople(userId,this.groupName,this.groupDetails.groupId , this.groupDetails.groupGenerationTIme);
    this.SocketService.addGroupResponse().then(
      (data)=>{
        console.log(data);
        if(data.status==200)
        {
          this.groupMembers = data.data.groupMembers;
          this.toastr.success('user added successfully to group');
        }
      },
      (err)=>{
        console.log(err);
        this.toastr.error('some error occured');
     }
      );
  }//end add

  public addDisable = (userId) =>{
    if(this.groupMembers.some(group=>group.userId===userId)){
      return true
    }
    else
    return false;
  }


  public getNextPages = () => {
    this.pageValue++;
    this.getUsers(this.pageValue, this.limit);
  }//end getnextpages

  public getPrevPages = () => {
    this.pageValue--;
    this.getUsers(this.pageValue, this.limit);
  }//end getprevpages

  public checkNext = () => {
    if (((this.pageValue + 1) * this.limit) >= this.Usercount) {
      return true;
    }
    else
      return false;
  }//end checknext

  

}
