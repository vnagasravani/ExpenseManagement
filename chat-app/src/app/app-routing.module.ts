import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';





const routes: Routes = [
  
  {path:'login' , component:LoginComponent ,pathMatch:'full'},
  {path:'' , redirectTo:'login' , pathMatch:'full'}
  
  
];

@NgModule({
  declarations:[],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
