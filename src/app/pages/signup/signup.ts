import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../models';
import { from } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private router = inject(Router);

  errorMessage: string = '';
  successMessage: string = '';

  reactiveForm: FormGroup = this.fb.group({
    name: [
      "",
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]
    ],
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
        Validators.required,
        Validators.maxLength(6)
      ]
    ],
    confirmPassword: [
      "",
      [
        Validators.required
      ]
    ]
  }, {
    // 2. We attach a custom validator to the whole form, not just one field!
    validators: this.passwordMatchValidator
  })

  // 3. The Custom Validator logic
  passwordMatchValidator(form: FormGroup){
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    // If they match, return null (no errors). If they don't, return a custom error object.
    return password === confirmPassword ? null : { mismatch: true };
  }

  inValid(field: string): boolean{
    const ctr = this.reactiveForm.get(field);
    return !!ctr && ctr.invalid && (ctr.dirty || ctr.touched);
  }

  // Helper specifically for the password mismatch error
  passwordMismatch(): boolean {
    const confirmCtrl = this.reactiveForm.get('confirmPassword');
    // Show error if the form has a mismatch AND they have touched the confirm box
    return this.reactiveForm.hasError('mismatch') && !!confirmCtrl && (confirmCtrl.dirty || confirmCtrl.touched);
  }
  
  get f(){
    return this.reactiveForm.controls;
  }

  onSignup(){
    this.errorMessage = '';
    this.successMessage = '';  
    
    if(this.reactiveForm.invalid){
      this.reactiveForm.markAllAsTouched();
      return;
    }
    
    const formValues = this.reactiveForm.value;

    // 2. Check if the EMAIL is already taken (Synchronous for now)
    const existingUser = this.db.users.find(u => u.email === formValues.email);

    if(existingUser){
      this.errorMessage = 'An account with this email already exists.'
      return;
    }

    // 3. Auto-generate a secure internal ID (e.g., u8374)
    const generatedId = 'u' + Math.floor(Math.random() * 10000);
    // console.log(generatedId);

    // Create new user
    const newUser: User = {
      id: generatedId,
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
      role: 'Pending',
      status: 'Pending' // <-- ADD THIS LINE!

    }

    this.db.users.push(newUser);

    this.successMessage = 'Signup successful! Please wait for an Admin to verify your account.';
    this.reactiveForm.reset();
  }


}
