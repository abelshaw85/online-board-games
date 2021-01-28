import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  greeting = {};
  isLoggedIn: boolean;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isUserLoggedIn();
  }

  handleLogout() {
    this.authService.logout();
  }

  getUsername() {
    return this.authService.getLoggedInUserName();
  }

}
