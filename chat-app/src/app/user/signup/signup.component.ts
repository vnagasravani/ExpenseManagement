import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public firstName: String;
  public lastName: String;
  public mobile:String;
  public email: String;
  public password: String;
  public apiKey: String;

  

 
  constructor(private appService:AppServiceService , private route:Router) { }

  ngOnInit() {
  }

  public goToSignIn(){
    this.route.navigate(['/']);
  }
  

  public signupFunction=()=>{
  let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobile,
      email: this.email,
      password: this.password,
      apiKey: this.apiKey
    }
   
console.log(data);
    this.appService.signUp(data).subscribe(
      (dataa)=>{console.log(dataa);
        setTimeout(()=>{this.route.navigate(['/']);},2000);
      },
      (error)=>{
        console.log("some error occured");
      }
    )
  }

}
