import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
    {path:'sign-up' , component:SignupComponent ,pathMatch:'full'}
   
];
@NgModule({
    declarations:[],
    imports: [RouterModule.forChild(routes)]
    
  })
  export class UserRoutingModule{}