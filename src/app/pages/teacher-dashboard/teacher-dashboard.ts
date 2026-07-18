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
    
    // // A. Does it exist?
    // const found = this.db.tokens.find(t => t.tokenString === codeToFind);

    // if (!found) {
    //   this.searchResult = 'invalid';
    //   this.errorMessage = 'Token not found in the database. Please check the code.';
    //   return;
    // }

    // this.searchedToken = found;

    // A. Fire off an HTTP GET request to Node.js to find the token
    this.db.searchTokenByString(codeToFind).subscribe({
      next: (tokenFromDB: Token) => {
        this.searchedToken = tokenFromDB;

        // B. Is it already used?
          if (this.searchedToken.status === 'Used') {
            this.searchResult = 'used';
            this.errorMessage = 'Alert: This token has already been marked as Used.';
            return;
          }

        // C. Is it expired? (Converting the MongoDB date string into a real Date object)
            const now = new Date();
            const expiryDate = new Date(this.searchedToken.expiresAt);
            
            if (now > expiryDate || this.searchedToken.status === 'Expired') {
                this.searchResult = 'expired';
                this.errorMessage = 'This token has expired and is no longer valid.';
                return;
            }

        // D. Success!
        this.searchResult = 'valid';
      },
      error: (err) => {
        // If the backend returns a 404 Not Found, it triggers this block
        this.searchResult = 'invalid';
        this.errorMessage = err.error?.message || 'Token not found in the database. Please check the code.';
      }
    });
  }

  // // 4. The Action Button
  // markAsUsed() {
  //   if (this.searchedToken) {
  //     this.searchedToken.status = 'Used'; // Updates the database
  //     this.searchResult = 'used'; // Updates the UI
  //   }
  // }

  // 4. The Action Button (Now updates MongoDB)
  markAsUsed() {
    // 1. Check if token exists and has an ID
    // We use 'this.searchedToken.id' directly because we are inside an if-check
    if (this.searchedToken && this.searchedToken.id) {
      
      // 2. Pass the ID, but provide a fallback string just in case
      this.db.markTokenAsUsed(this.searchedToken.id).subscribe({
        next: () => {
          // 3. Update the UI
          if (this.searchedToken) {
            this.searchedToken.status = 'Used'; 
          }
          this.searchResult = 'used'; 
        },
        error: (err) => {
          this.errorMessage = 'Network error: Could not update the token in the database.';
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
  onLogout() {
    // 1. Clear Angular's session memory
    this.db.currentUser = null;
    
    // 2. Shred the JWT visitor badge from browser memory!
    localStorage.removeItem('tms_token');
    
    // 3. Redirect
    this.router.navigate(['/login']);
  }
}
  

