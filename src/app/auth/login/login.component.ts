import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;
  password : string;
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

  handleLogin() {
    this.sending = true;
    this.authenticationService.login(this.username, this.password).subscribe((result) => {
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
