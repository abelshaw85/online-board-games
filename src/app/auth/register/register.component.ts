import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../auth.service';
import { ResponseMessage } from '../response-message.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  userName: string;
  password : string;
  matchingPassword : string;
  errorMessage: string;
  successMessage: string;
  faUser = faUser;
  faLock = faLock;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) {   }

  ngOnInit() {
  }

  handleRegistration() {
    this.authenticationService.register(this.userName, this.password, this.matchingPassword).subscribe((result) => {
      let response: ResponseMessage = result;
      if (response.type == "RegistrationSuccess") {
        this.successMessage = response.message;
        this.errorMessage = null;
      } else {
        this.errorMessage = response.message;
        this.successMessage = null;
      }
    }, (response) => {
      this.errorMessage = "Something went wrong.";
    });
  }

}
