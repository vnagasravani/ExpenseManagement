import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  public rpassword;
  public npassword;
  public cpassword;

  constructor(private AppService: AppServiceService, private toaster: ToastrService, private router: Router) { }

  ngOnInit() {
  }

  public ResetPassword = () => {
    if (!this.rpassword) {
      this.toaster.warning('enter recovery password ');
    }
    else if (!this.npassword) {
      this.toaster.warning('enter new password ');
    }
    else if (!this.cpassword) {
      this.toaster.warning('re-enter password');
    }
    else if (!(this.npassword === this.cpassword)) {
      this.toaster.warning('passwords are not being matched');
    }
    else {

      this.AppService.resetPassword(this.rpassword, this.npassword).subscribe(
        data => {
          if (data.status == 200) {
            this.toaster.success('password updated successfully');
            setTimeout(() => {
              this.goToLogIn();
            }, 1500);
          }
           else {
            this.toaster.warning(data.message);
          }
        },
        (err)=>{
          this.toaster.error('some error occured');
        }
      )
    }

  }//end submit resetPassword

  public goToLogIn() {
    this.router.navigate(['/login']);
  }//end gotoLogin

}
