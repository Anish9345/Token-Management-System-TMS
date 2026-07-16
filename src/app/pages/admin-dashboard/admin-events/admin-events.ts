import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import { Event } from '../../../models';

@Component({
  selector: 'app-admin-events',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.css',
})
export class AdminEvents implements OnInit {

  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);

  allEvents: Event[] = [];
  successMessage: string = '';
  
  // Dual-Purpose State Variables
  isEditing: boolean = false;
  editingEventId: string | null = null;

  eventForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required]
  });

  ngOnInit() {
    this.refreshData();
  }

  // 1. The Dual-Purpose Submit Engine
  onSubmitEvent() {
    this.successMessage = '';

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formValues = this.eventForm.value;
    const formDate = new Date(formValues.date);

    if (this.isEditing && this.editingEventId) {
      // SCENARIO A: UPDATE EXISTING EVENT
      const eventIndex = this.db.events.findIndex(e => e.id === this.editingEventId);
      if (eventIndex !== -1) {
        this.db.events[eventIndex].name = formValues.name;
        this.db.events[eventIndex].date = formDate;
        this.db.events[eventIndex].location = formValues.location;
        this.successMessage = `Successfully updated event: ${formValues.name}`;
      }
    } else {
      // SCENARIO B: CREATE NEW EVENT
      const newEvent: Event = {
        id: 'evt_' + Math.floor(Math.random() * 10000),
        name: formValues.name,
        date: formDate,
        location: formValues.location
      };
      this.db.events.push(newEvent);
      this.successMessage = `Successfully created new event: ${newEvent.name}`;
    }

    // Reset the form back to 'Create' mode
    this.onCancelEdit(); 
    this.refreshData();
  }

  // 2. Trigger Edit Mode
  onEditEvent(event: Event) {
    this.isEditing = true;
    this.editingEventId = event.id;
    this.successMessage = '';

    // Date formatting trick: <input type="date"> strictly requires 'YYYY-MM-DD'
    const dateString = event.date.toISOString().split('T')[0];

    // patchValue auto-fills the form!
    this.eventForm.patchValue({
      name: event.name,
      date: dateString,
      location: event.location
    });
  }

  // 3. Cancel Edit Mode
  onCancelEdit() {
    this.isEditing = false;
    this.editingEventId = null;
    this.eventForm.reset();
  }

  // 4. Delete Engine (With native browser confirmation)
  onDeleteEvent(event: Event) {
    // This creates the little browser popup asking for confirmation
    const confirmDelete = confirm(`⚠️ Are you sure you want to delete ${event.name}? This action cannot be undone.`);
    
    if (confirmDelete) {
      // Replaces the database array with a new one that EXCLUDES this specific event
      this.db.events = this.db.events.filter(e => e.id !== event.id);
      this.successMessage = `Deleted event: ${event.name}`;
      this.refreshData();
    }
  }

  private refreshData() {
    this.allEvents = this.db.events;
  }
}
