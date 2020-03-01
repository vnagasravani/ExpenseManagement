import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent  
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(),
   // NgMultiSelectDropDownModule.forRoot(),
    AngularFontAwesomeModule,
    AppRoutingModule,
    HttpClientModule,
    UserModule,
    SharedModule,
    GroupModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
