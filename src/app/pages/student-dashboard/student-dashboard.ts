import { Component, inject, OnInit } from '@angular/core';
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
export class StudentDashboard implements OnInit{

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

  // ngOnInit(){
  //   // We are still loading events from the local dummy data for now
  //   this.availableEvents = this.db.events;

  //   // Fetch the real tokens from MongoDB!
  //   this.refreshMyTokens();
  // }

  ngOnInit(){
    // 1. Fetch the live events from MongoDB via Node.js!
    this.db.getAllEvents().subscribe({
      next: (eventsFromDB: Event[]) => {
        this.availableEvents = eventsFromDB;
      },
      error: (err) => {
        this.errorMessage = 'Could not load events from the server.';
        console.error(err);
      }
    });

    // 2. Fetch the real tokens from MongoDB!
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

    // // Safety check just in case
    // if (!user) return;

    if (!user || !user.id) {
      this.errorMessage = 'Authentication error. Please log in again.';
      return;
    }

    // Calculate the exact expiration date based on input
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + formValues.validityDays);
  
    // Build the token payload (Notice we removed the fake 'id' property, MongoDB does that!)
    const tokenPayload = {
      tokenString: `TKN-${this.generateSecureHex()}-${this.generateSecureHex()}`,
      userId: user.id, 
      eventId: formValues.eventId,
      createdAt: new Date(),
      expiresAt: expirationDate,
      status: 'Active'
    };

    // // Build the secure Token object
    // const newToken: Token = {
    //   id: 'tkn_' + Math.floor(Math.random() * 100000),
    //   tokenString: `TKN-${this.generateSecureHex()}-${this.generateSecureHex()}`,
    //   userId: user.id,
    //   eventId: formValues.eventId,
    //   createdAt: new Date(),
    //   expiresAt: expirationDate,
    //   status: 'Active'
    // };

  //   // Save it to our fake database
  //   this.db.tokens.push(newToken);

  //   // Update the UI
  //   this.successMessage = `Successfully generated token: ${newToken.tokenString}`;

  //   // Reset form but keep 1 day as the default value
  //   this.tokenForm.reset({ validityDays: 1, eventId: '' }); 
  //   this.refreshMyTokens();
  
  // }

    // 1. SEND THE REQUEST: Fire it off to Node.js!
    this.db.saveTokenToDB(tokenPayload).subscribe({
      next: (savedToken: any) => {
        this.successMessage = `Successfully generated token: ${tokenPayload.tokenString}`;
        this.tokenForm.reset({ validityDays: 1, eventId: '' }); 
        
        // 2. REFRESH: Pull the newly updated list directly from the database
        this.refreshMyTokens();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Server error while generating token.';
      }
    });
  }

//   // 8. Grab only the tokens that belong to the logged-in student
//   private refreshMyTokens() {
//     if (this.db.currentUser) {
//       this.myTokens = this.db.tokens.filter(t => t.userId === this.db.currentUser?.id);
//     }
//   }

//   // 3. Add this function at the very bottom of your class
//   onLogout() {
//     this.db.currentUser = null; // Clears the session!
//     this.router.navigate(['/login']); // Sends them back to the login page
//   }
// }


private refreshMyTokens() {
    const user = this.db.currentUser;
    
    if (user && user.id) {
      // Use the new network call to talk to Node.js
      this.db.getTokensFromDB(user.id).subscribe({
        next: (tokensFromDB: Token[]) => {
          // Overwrite our empty array with the live data from MongoDB
          this.myTokens = tokensFromDB;
        },
        error: (err) => {
          this.errorMessage = 'Could not load tokens from the server.';
          console.error(err);
        }
      });
    }
  }

  onLogout() {
    // 1. Clear Angular's session memory
    this.db.currentUser = null; 
    
    // 2. NEW SECURITY RULE: Shred the JWT visitor badge from browser memory!
    localStorage.removeItem('tms_token');
    
    // 3. Kick them to the curb
    this.router.navigate(['/login']); 
  }
}
