import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  username: string;
  password : string;
  repeatPassword : string;
  errorMessage = 'No';
  successMessage: string;
  registrationFail = false;
  registrationSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) {   }

  ngOnInit() {
  }

  handleRegistration() {
    this.authenticationService.register(this.username, this.password, this.repeatPassword).subscribe((result) => {
      this.successMessage = 'Login Successful.';
      this.registrationSuccess = true;
      //this.router.navigate(['']);
    }, () => {
      console.log("whoops");
      this.registrationFail = true;
    });
  }

}
