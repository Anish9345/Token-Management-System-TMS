import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private db = inject(DatabaseService);
  private router = inject(Router);

  // Notice we added 'route: ActivatedRouteSnapshot' here
  canActivate(route: ActivatedRouteSnapshot): boolean {

    // 1. Grab the specific role required for this exact route
    const expectedRole = route.data['requiredRole'];
    const user = this.db.currentUser;

    // 2. Check if they are logged in AND their role matches the expected role
    if (user && user.role === expectedRole) {
      return true; // Door opens
    }

    // Door closes
    this.router.navigate(['/login']);
    return false;
  }

}

