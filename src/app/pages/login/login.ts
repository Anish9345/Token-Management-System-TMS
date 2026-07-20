import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';


@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private router = inject(Router);

  private cdr = inject(ChangeDetectorRef); // 2. Inject it
  
  errorMessage: string = '';

  reactiveForm: FormGroup = this.fb.group({
    email: [
      "",
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      "",
      [
        Validators.required
      ]
    ]
  })

  inValid(field: string): boolean{
    const ctr = this.reactiveForm.get(field);
    return !!ctr && ctr.invalid && (ctr.dirty || ctr.touched);
  }

  get f(){
    return this.reactiveForm.controls;
  }

  onLogin(){
    this.errorMessage = '';

    if(this.reactiveForm.invalid){
      this.reactiveForm.markAllAsTouched();
      return;
    }

// 2. Extract both values
    const { email, password } = this.reactiveForm.value;

// We call a new login function that we will build in your DatabaseService
    this.db.loginUser(email, password).subscribe({
      next: (response: any) => {
        
        // 1. Save the mathematically signed JWT to the browser's memory!
        localStorage.setItem('tms_token', response.token); 

        // 2. Save the user data to your service so the rest of the app knows who is logged in
        this.db.currentUser = response.user;

        // 3. Route based on the verified role from the backend
        if (response.user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (response.user.role === 'Teacher') {
          this.router.navigate(['/teacher']);
        } else if (response.user.role === 'Student') {
          this.router.navigate(['/student']);
        } else {
          this.errorMessage = 'Your account is pending approval.';
        }
      },
      error: (err) => {
        console.error("Login Error Details:", err);
        // If the backend returns a 401 or 403, grab the exact message sent from Node.js
        this.errorMessage = err.error?.message || 'Invalid Email or Password.';

        // 2. ADD THIS LINE HERE: This forces Angular to refresh the UI immediately
        this.cdr.detectChanges();
      }
    });
  }
  
}
