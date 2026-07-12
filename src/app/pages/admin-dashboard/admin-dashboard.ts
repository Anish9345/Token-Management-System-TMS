import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { Event, Token } from '../../models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private router = inject(Router);

  // 1. God-Mode State Variables
  allEvents: Event[] = [];
  allTokens: Token[] = [];
  successMessage: string = '';
  showClearConfirm: boolean = false;

  // 2. The Event Creation Form
  eventForm: FormGroup = this.fb.group({
    name: [
      "",
      [
        Validators.required
      ]
    ],
    date: [
      "",
      [
        Validators.required
      ]
    ],
    location: [
      "",
      Validators.required
    ]
  });

  // 3. Auto-Load Data
  ngOnInit() {
    this.refreshData();
  }

  // 4. The Event Engine
  onCreateEvent() {
    this.successMessage = '';

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formValues = this.eventForm.value;

    const newEvent: Event = {
      id: 'evt_' + Math.floor(Math.random() * 10000),
      name: formValues.name,
      date: new Date(formValues.date), 
      location: formValues.location
    };

    this.db.events.push(newEvent);
    
    this.successMessage = `Successfully created new event: ${newEvent.name}`;
    this.eventForm.reset();
    this.refreshData();
  }

  // 5. Form Validation Helper
  inValid(field: string): boolean {
    const ctr = this.eventForm.get(field);
    return !!ctr && ctr.invalid && (ctr.dirty || ctr.touched);
  }

  // 6. Destructive Action Controls
  onToggleClearConfirm() {
    this.showClearConfirm = !this.showClearConfirm;
  }

  onClearAllTokens() {
    // Safely empty the master array
    this.db.tokens.splice(0, this.db.tokens.length);
    
    this.successMessage = 'SECURITY ALERT: All tokens have been permanently deleted.';
    this.showClearConfirm = false; 
    this.refreshData(); 
  }

  // 7. Master Audit Data Fetch
  private refreshData() {
    this.allEvents = this.db.events;
    this.allTokens = this.db.tokens; 
  }

  // 8. Eject Button
  onLogout() {
    this.db.currentUser = null;
    this.router.navigate(['/login']);
  }

}

