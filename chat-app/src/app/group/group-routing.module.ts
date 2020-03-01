import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './group/group.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
    {path:'dashboard' , component:DashboardComponent ,pathMatch:'full'},
    {path:'group/:groupName',component:GroupComponent,pathMatch:'full'},
    {path:'search/:groupName',component:SearchComponent,pathMatch:'full'}
   
   
];
@NgModule({
    declarations:[],
    imports: [RouterModule.forChild(routes)],
    exports:[RouterModule]
    
  })
  export class GroupRoutingModule{}