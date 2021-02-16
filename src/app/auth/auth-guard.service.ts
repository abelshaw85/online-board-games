import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
        Observable<boolean> |
        Promise<boolean> |
        boolean {

    if (!this.authService.isUserLoggedIn()) {
      // Adds an error message to the login page to inform the user
      this.router.navigate(['/login'], {
        queryParams: {error: 'unauthorised'}
      });
      return false;
    } else {
      return true;
    }
  }
}
