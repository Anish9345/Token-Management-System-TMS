import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { Token } from '../../models';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, CommonModule],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.css',
})
export class TeacherDashboard {
  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private router = inject(Router);

  searchedToken: Token | null = null;
  searchResult: 'idle' | 'valid' | 'invalid' | 'expired' | 'used' = 'idle';
  errorMessage: string = '';

  searchForm: FormGroup = this.fb.group({
    tokenCode: [
      "",
      [
        Validators.required,
        Validators.pattern(/^TKN-[A-F0-9]{4}-[A-F0-9]{4}$/i) // e.g., TKN-8F3A-99B1
      ]
    ]
  });

  // ADD THIS HELPER FUNCTION:
  inValid(field: string): boolean {
    const ctr = this.searchForm.get(field);
    return !!ctr && ctr.invalid && (ctr.dirty || ctr.touched);
  }

  // 3. The Verification Engine
  onSearch() {
    // Reset state on every new search
    this.searchResult = 'idle';
    this.errorMessage = '';
    this.searchedToken = null;

    if(this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    // Grab what the teacher typed, trim spaces, and make it uppercase
    const codeToFind = this.searchForm.value.tokenCode.trim().toUpperCase();
    
    // A. Does it exist?
    const found = this.db.tokens.find(t => t.tokenString === codeToFind);

    if (!found) {
      this.searchResult = 'invalid';
      this.errorMessage = 'Token not found in the database. Please check the code.';
      return;
    }

    this.searchedToken = found;

    // B. Is it already used?
    if (found.status === 'Used') {
      this.searchResult = 'used';
      this.errorMessage = 'Alert: This token has already been marked as Used.';
      return;
    }
    // C. Is it expired?
    const now = new Date();
    if (now > found.expiresAt) {
       this.searchResult = 'expired';
       found.status = 'Expired'; // Auto-update the database!
       this.errorMessage = 'This token has expired and is no longer valid.';
       return;
    }

    // D. Success!
    this.searchResult = 'valid';
  }

  // 4. The Action Button
  markAsUsed() {
    if (this.searchedToken) {
      this.searchedToken.status = 'Used'; // Updates the database
      this.searchResult = 'used'; // Updates the UI
    }
  }

  // 5. Logout
  onLogout() {
    this.db.currentUser = null;
    this.router.navigate(['/login']);

  }

}
  

