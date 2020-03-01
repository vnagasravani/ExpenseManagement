import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { Router } from '@angular/router';
import {Cookie} from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email:String;
  public password:String;

  

  constructor(private appService:AppServiceService,private route:Router) { }

  ngOnInit() {
  }

  public goToSignUp(){
    this.route.navigate(['/sign-up']);
    
  }

  signinFunction(){
    let data={
      email:this.email,
     password:this.password
 
   };
  
   this.appService.login(data).subscribe((data)=>{
     console.log(data);
     this.appService.setUserInfo(data);
     Cookie.set('AuthToken',data.data.authToken);
     Cookie.set('userId',data.data.userId);
     Cookie.set('userName',data.data.userName);
     Cookie.set('email',data.data.email);
     this.route.navigate(['/dashboard']);

   },
   (error)=>{
     console.log(error.message);
   })


  }

}
