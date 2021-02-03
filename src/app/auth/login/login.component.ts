import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage: string;
  successMessage: string;
  faUser = faUser;
  faLock = faLock;
  sending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) {   }

  ngOnInit() {
    // Set the error message if one exists.
    let errorType = this.route.snapshot.queryParamMap.get('error');
    switch(errorType) {
      case 'unauthorised':
        this.errorMessage = "You must be logged in to access that page.";
        break;
      default:
        break;
    }
  }

  submitLogin(form: NgForm) {
    console.log(form);
    let userData = {
      username: form.value.username,
      password: form.value.password
    };
    this.handleLogin(userData.username, userData.password);
  }


  handleLogin(username, password) {
    this.sending = true;
    this.authenticationService.login(username, password).subscribe((result) => {
      this.successMessage = "Login Successful.";
      this.errorMessage = null;
      this.router.navigate(['']);
      this.sending = false;
    }, () => {
      this.errorMessage = "Error logging in, please check your credentials.";
      this.successMessage = null;
      this.sending = false;
    });
  }

}
