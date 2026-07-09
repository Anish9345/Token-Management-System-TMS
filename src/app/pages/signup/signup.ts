import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../models';

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
    userId: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^u[1-9][0-9]*$/)
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

  onSignup(){
    this.errorMessage = '';
    this.successMessage = '';  
    
    if(this.reactiveForm.invalid){
      this.reactiveForm.markAllAsTouched();
      return;
    }
    
    const formValues = this.reactiveForm.value;
    const existingUser = this.db.users.find(u => u.id === formValues.userId);

    if(existingUser){
      this.errorMessage = 'This User ID is already taken. Please choose another.'
      return;
    }

    // Create new user
    const newUser: User = {
      id: formValues.userId,
      name: formValues.name,
      role: 'Pending'

    }

    this.db.users.push(newUser);

    this.successMessage = 'Signup successful! Please wait for an Admin to verify your account.';
    this.reactiveForm.reset();
  }

}
