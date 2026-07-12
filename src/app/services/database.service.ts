import { Injectable} from '@angular/core';
import { Event, Token, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
    // 1. Our Fake Tables (Arrays)
    users: User[] = [
        { 
        id: 'u1', // Or 'u01' depending on your regex 
        name: 'Admin User', 
        email: 'admin@tms.com', 
        password: 'password123', 
        role: 'Admin' 
        },
        { 
        id: 'u2', 
        name: 'Test Teacher', 
        email: 'teacher@tms.com', 
        password: 'password123', 
        role: 'Teacher' 
        },
        { 
        id: 'u3', 
        name: 'Test Student', 
        email: 'student@tms.com', 
        password: 'password123', 
        role: 'Student' 
        }
    ];

    events: Event[] = [
        {
            id: 'evt_1', 
            name: 'Cybersecurity CTF Championship', 
            // Wrap the string in new Date()
            date: new Date('2026-08-15'), 
            // Changed description to location
            location: 'Main Security Lab',
            // description: 'Annual Capture The Flag event.'
        },
        {
            id: 'evt_3', 
            name: 'Hackathon: AI Solutions', 
            // Wrap the string in new Date()
            date: new Date('2026-10-05'), 
            // Changed description to location
            location: 'Innovation Auditorium',
            // description: '48-hour coding challenge.' 
        }
    ];

// 2. An empty array to store the tokens as they are generated
  tokens: Token[] = [];

    // ADD THIS LINE: Save the session!
    currentUser: User | null = null;


}
