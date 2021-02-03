import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
  errorMessage: string;
  successMessage: string;
  registrationForm: FormGroup;
  faUser = faUser;
  faLock = faLock;
  sending = false;

  constructor(
    private authenticationService: AuthenticationService) {   }

  ngOnInit() {
    this.registrationForm = new FormGroup({
      'username': new FormControl(null, [
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern("[\\w_-]{1,15}")
      ]),
      'password': new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$")
      ]),
      'matchingPassword': new FormControl('', [
        Validators.required
      ])
    },
      this.checkPasswords
    );
  }

  submitRegistration() {
    const username = this.registrationForm.get("username").value;
    const password = this.registrationForm.get("password").value;
    const matchingPassword = this.registrationForm.get("matchingPassword").value;
    this.sending = true;
    this.authenticationService.register(username, password, matchingPassword).subscribe((result) => {
      let response: ResponseMessage = result;
      if (response.type == "RegistrationSuccess") {
        this.successMessage = response.message;
        this.errorMessage = null;
      } else {
        this.errorMessage = response.message;
        this.successMessage = null;
      }
      this.sending = false;
    }, (response) => {
      this.errorMessage = "Something went wrong.";
    });
  }

  checkPasswords(group: FormGroup): {notSame: boolean} {
    const password = group.get('password').value;
    const matchingPassword = group.get('matchingPassword').value;

    return password === matchingPassword ? { notSame: false } : { notSame: true };
  }

}
