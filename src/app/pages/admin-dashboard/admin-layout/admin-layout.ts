import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private db = inject(DatabaseService);
  private router = inject(Router);

  onLogout(){
    this.db.currentUser = null;
    this.router.navigate(['/login']);
  }
}


