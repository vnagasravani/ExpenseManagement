import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupRoutingModule } from './group-routing.module'
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchComponent } from './search/search.component';
import { GroupComponent } from './group/group.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
  declarations: [DashboardComponent, SearchComponent, GroupComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    NgxSpinnerModule,
    FormsModule,
    ToastrModule.forRoot(),
   // NgMultiSelectDropDownModule.forRoot(),
    GroupRoutingModule
  ],
  exports:[GroupRoutingModule]
})
export class GroupModule { }
