import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
    {path:'sign-up' , component:SignupComponent ,pathMatch:'full'},
    {path:'forgotpassword',component:ForgotPasswordComponent,pathMatch:'full'}
   
];
@NgModule({
    declarations:[],
    imports: [RouterModule.forChild(routes)],
    exports:[RouterModule]
    
  })
  export class UserRoutingModule{}