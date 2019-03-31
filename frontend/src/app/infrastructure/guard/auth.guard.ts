import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {Observable} from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,   private router: Router) {  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isSignedIn()) {
      return true;
    } else {
      this.router.navigateByUrl('/auth');
    }
  }
}
