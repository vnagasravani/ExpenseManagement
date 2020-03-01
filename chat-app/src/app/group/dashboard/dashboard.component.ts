import { Component, OnInit ,ViewChild ,  ElementRef} from '@angular/core';

import {AppServiceService} from './../../app-service.service'
import { ToastrService } from 'ngx-toastr';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { SocketserviceService } from 'src/app/socketservice.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public groups = [];
  public filteredGroups = [];
  public userId = Cookie.get('userId');
  public searchValue = false;
  

  @ViewChild('searchInput', {static: true}) searchInput: ElementRef;

  constructor(private appService:AppServiceService,private router:Router,private toastr: ToastrService,private socketService:SocketserviceService) { }

  ngOnInit() {
   this. getUser(this.userId);
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
     this.appService.groupCreation(name , description).subscribe(
       (data)=>{
          if(data.status==200)
          this.router.navigate(['/group',name]);
          else
          this.toastr.warning(data.message);
       },
       (err)=>{
        this.toastr.error(err.message);
       }
     )
  }

public getUser = (userId)=>{
this.appService.getUser().subscribe(
  (data)=>{
   this.groups = data.data.groupsList
   console.log(this.groups);
  },
  (error)=>{
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
