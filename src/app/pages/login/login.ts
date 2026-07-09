import { Component, inject } from '@angular/core';
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

// 3. Search the database for an exact match of BOTH email and password
    const foundUser = this.db.users.find(u => u.email === email && u.password === password);

    if(foundUser){

      // ADD THIS LINE: Save the session!
      this.db.currentUser = foundUser;

      if(foundUser.role === 'Admin'){
        this.router.navigate(['/admin']);
      }else if(foundUser.role == 'Teacher'){
        this.router.navigate(['/teacher']);
      }else if(foundUser.role === 'Student'){
        this.router.navigate(['/student']);
      }else{
        this.errorMessage = 'Your account is pending approval.';
      }
    }else{
      this.errorMessage = 'Invalid Email or Password.';
    }
  }
  
}
