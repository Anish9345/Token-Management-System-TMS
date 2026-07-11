import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { Token, Event } from '../../models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-student-dashboard',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard {

  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private router = inject(Router);

  // Data for the UI
  availableEvents: Event[] = [];
  myTokens: Token[] = [];

  errorMessage: string = '';
  successMessage: string = '';

  tokenForm: FormGroup = this.fb.group({
    eventId: [
      "",
      [
        Validators.required
      ]
    ],
    validityDays: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(30)
      ]
    ]
  });

  ngOnInit(){
    this.availableEvents = this.db.events;
    this.refreshMyTokens();
  }

  inValid(field: string): boolean{
    const ctr = this.tokenForm.get(field);
    return !!ctr && ctr.invalid && (ctr.dirty || ctr.touched);
  }

  // 6. Secure Hex Generator (e.g., "8F3A")
  private generateSecureHex(): string {
    return Math.random().toString(16).substring(2, 6).toUpperCase();
  }

  // 7. Form Submission Logic
  onGenerateToken() {
    this.errorMessage = '';
    this.successMessage = '';

    if(this.tokenForm.invalid){
      this.tokenForm.markAllAsTouched();
      return;
    }

    const formValues = this.tokenForm.value;
    const user = this.db.currentUser;

    // Safety check just in case
    if (!user) return;

    // Calculate the exact expiration date based on input
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + formValues.validityDays);
  
    // Build the secure Token object
    const newToken: Token = {
      id: 'tkn_' + Math.floor(Math.random() * 100000),
      tokenString: `TKN-${this.generateSecureHex()}-${this.generateSecureHex()}`,
      userId: user.id,
      eventId: formValues.eventId,
      createdAt: new Date(),
      expiresAt: expirationDate,
      status: 'Active'
    };

    // Save it to our fake database
    this.db.tokens.push(newToken);

    // Update the UI
    this.successMessage = `Successfully generated token: ${newToken.tokenString}`;

    // Reset form but keep 1 day as the default value
    this.tokenForm.reset({ validityDays: 1, eventId: '' }); 
    this.refreshMyTokens();
  
  }

  // 8. Grab only the tokens that belong to the logged-in student
  private refreshMyTokens() {
    if (this.db.currentUser) {
      this.myTokens = this.db.tokens.filter(t => t.userId === this.db.currentUser?.id);
    }
  }

  // 3. Add this function at the very bottom of your class
  onLogout() {
    this.db.currentUser = null; // Clears the session!
    this.router.navigate(['/login']); // Sends them back to the login page
  }
}

