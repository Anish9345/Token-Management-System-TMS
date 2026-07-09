import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


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
    userId: [
      "",
      [
        Validators.required,
        Validators.minLength(2)
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

    const typedId = this.reactiveForm.value.userId;
    const foundUser = this.db.users.find(u => u.id === typedId);

    if(foundUser){
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
      this.errorMessage = 'Invalid User ID.';
    }
  }

}
