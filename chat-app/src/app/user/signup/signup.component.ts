import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  
  public allCountries ;
  public countryCodes ; 
  public countries = [];
  public country;
  public firstName: String;
  public lastName: String;
  public mobile:String;
  public code :String;
  public email: String;
  public password: String;
  public countryCode:string;
  public countryName:string;

  

 
  constructor(private appService:AppServiceService , private route:Router , private toaster:ToastrService) { }

  ngOnInit() {
    this.getCountries();
    this.getCountryCodes();
  }

  public goToSignIn(){
    this.route.navigate(['/']);
  }

  public getCountries = ()=>{
    this.appService.getCountryNames().subscribe(
      (data)=>{
        this.allCountries = data;
        for( let i in data){

          let singleCountry = {
             name:data[i],
             code : i
          }
          this.countries.push(singleCountry);
        }
        this.countries = this.countries.sort((first, second)=>{
          return first.name.toUpperCase() < second.name.toUpperCase() ? -1 :( first.name.toUpperCase() > second.name.toUpperCase()? 1 :0 ) ; 
        });
      }
    )
  }//end get countries

  public getCountryCodes(){
    this.appService.getCountryNumbers()
      .subscribe((data) => {
        this.countryCodes = data;
      })
  }//end  getcountryCodes

  public onChangeOfCountry(){

    this.countryCode = this.countryCodes[this.country];
    this.countryName = this.allCountries[this.country];
  }
  

  public signupFunction=()=>{
  let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: `${this.countryCode}${this.mobile}`,
      email: this.email,
      password: this.password,
    }
   
console.log(data);
    this.appService.signUp(data).subscribe(
      (dataa)=>{console.log(dataa);
        if(dataa.status == 200)
        setTimeout(()=>{this.route.navigate(['/']);},2000);
        else
        this.toaster.error(dataa.message);
      },
      (error)=>{
        this.toaster.error('some error occured')
        console.log("some error occured");
      }
    )
  }

}
