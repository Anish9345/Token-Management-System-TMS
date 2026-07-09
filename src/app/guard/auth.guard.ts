import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private db = inject(DatabaseService);
  private router = inject(Router);

  canActivate(): boolean {
      if(this.db.currentUser && this.db.currentUser.role === 'Student'){
        return true;
      }

      this.router.navigate(['/login']);
      return false;
  }
}
