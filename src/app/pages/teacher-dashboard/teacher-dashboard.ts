import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
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

  private cdr = inject(ChangeDetectorRef); // 2. Inject

  // private searchTrigger = new BehaviorSubject<string>('');

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
    this.searchResult = 'idle';
    this.errorMessage = '';
    this.searchedToken = null;

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const codeToFind = this.searchForm.value.tokenCode.trim().toUpperCase();

    this.db.searchTokenByString(codeToFind).subscribe({
      next: (tokenFromDB: Token) => {
        this.searchedToken = tokenFromDB;

        // B. Check if used
        if (this.searchedToken.status === 'Used') {
          this.searchResult = 'used';
          this.errorMessage = 'Alert: This token has already been marked as Used.';
        } 
        // C. Check if expired
        else {
          const now = new Date();
          const expiryDate = new Date(this.searchedToken.expiresAt);
          
          if (now > expiryDate || this.searchedToken.status === 'Expired') {
            this.searchResult = 'expired';
            this.errorMessage = 'This token has expired and is no longer valid.';
          } else {
            // D. Success
            this.searchResult = 'valid';
          }
        }
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        this.searchResult = 'invalid';
        this.errorMessage = err.error?.message || 'Token not found in the database.';
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  // 4. The Action Button (Now updates MongoDB)
  markAsUsed() {
    if (this.searchedToken && this.searchedToken._id) {
      this.db.markTokenAsUsed(this.searchedToken._id).subscribe({
        next: () => {
          if (this.searchedToken) {
            this.searchedToken.status = 'Used'; 
          }
          this.searchResult = 'used'; 
          this.cdr.detectChanges(); // Force UI update
        },
        error: (err) => {
          this.errorMessage = 'Network error: Could not update the token in the database.';
          this.cdr.detectChanges(); // Force UI update
        }
      });
    }
  }

//   // 5. Logout
//   onLogout() {
//     this.db.currentUser = null;
//     this.router.navigate(['/login']);

//   }

// }

// 5. Logout
//   onLogout() {
//     // 1. Clear Angular's session memory
//     this.db.currentUser = null;
    
//     // 2. Shred the JWT visitor badge from browser memory!
//     localStorage.removeItem('tms_token');
    
//     // 3. Redirect
//     this.router.navigate(['/login']);
//   }
// }
  
onLogout() {
    this.db.currentUser = null;
    localStorage.removeItem('tms_token');
    this.router.navigate(['/login']);
  }
}

