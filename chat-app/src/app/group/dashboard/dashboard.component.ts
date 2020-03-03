import { Component, OnInit ,ViewChild ,  ElementRef} from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner"
import {AppServiceService} from './../../app-service.service'
import { ToastrService } from 'ngx-toastr';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { SocketserviceService } from 'src/app/socketservice.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';





@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('groupList', [
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
export class DashboardComponent implements OnInit {
  public groups = [];
  public filteredGroups = [];
  public userId = Cookie.get('userId');
  public searchValue = false;
  public loading =  true;
  

  @ViewChild('searchInput', {static: true}) searchInput: ElementRef;

  constructor(private appService:AppServiceService,private router:Router,private toastr: ToastrService,private socketService:SocketserviceService,private spinner:NgxSpinnerService) { }

  ngOnInit() {
   this. getUser(this.userId);

   this.spinner.show();

  }

  public searchGroup=()=>{
    this.searchValue = true;
    this.filteredGroups=this.search(this.searchInput.nativeElement.value);
     console.log(this.filteredGroups);
  }

  public unsearch = ()=>{
    console.log('focusout function is called');
   this.searchInput.nativeElement.value='';
   this.filteredGroups=[];
   this.searchValue = false;
  }


  public search = (data):Array<String>=>{
   return this.groups.filter((group):Array<String>=>{
          return group.groupName.includes(data);
         });
  }

  public createGroup = (name , description)=>{
    console.log(name);
    if(name == undefined || name =='')
    {
      this.toastr.warning('enter Groupname');
    }
    else
    {
     this.appService.groupCreation(name , description).subscribe(
       (data)=>{
          if(data.status==200){
            this.groups.push(data.data);
            this.toastr.success(data.message);
          }
          
          else
          {
            this.toastr.warning(data.message);
          }
          
       },
       (err)=>{
        console.log(err.message);
        this.toastr.error('error occured');
       })
     
      }
  }

public getUser = (userId)=>{
this.appService.getUser().subscribe(
  (data)=>{
    this.loading = false;
   this.groups = data.data.groupsList
   console.log(this.groups);
  },
  (error)=>{
    this.toastr.error('some error occured');
    console.log(error);
  }

)}

public logout: any = () => {

  this.appService.logout()
    .subscribe((apiResponse) => {

      if (apiResponse.status === 200) {
        console.log("logout called")
        Cookie.delete('AuthToken');

        Cookie.delete('userId');

        Cookie.delete('userName');

        Cookie.delete('email');

        this.socketService.exitSocket();

        this.router.navigate(['/login']);

      } else {
        this.toastr.error(apiResponse.message)

      } // end condition

    }, (err) => {
      this.toastr.error('some error occured')


    });

} // end logout




}
