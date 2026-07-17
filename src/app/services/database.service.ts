import { inject, Injectable} from '@angular/core';
import { Event, Token, User } from '../models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

    // 2. Modern Angular Dependency Injection
    private http = inject(HttpClient);

    // 3. The URL of your active Node.js server
    private apiUrl = 'http://localhost:3000/api';

    // // 1. Our Fake Tables (Arrays)
    // users: User[] = [
    //     { 
    //     id: 'u1', // Or 'u01' depending on your regex 
    //     name: 'Admin User', 
    //     email: 'admin@tms.com', 
    //     password: 'password123', 
    //     role: 'Admin' ,
    //     status: 'Approved' // <-- Add status
    //     },
    //     { 
    //     id: 'u2', 
    //     name: 'Test Teacher', 
    //     email: 'teacher@tms.com', 
    //     password: 'password123', 
    //     role: 'Teacher',
    //     status: 'Approved' // <-- Add status 
    //     },
    //     { 
    //     id: 'u3', 
    //     name: 'Test Student', 
    //     email: 'student@tms.com', 
    //     password: 'password123', 
    //     role: 'Student',
    //     status: 'Approved' // <-- Add status 
    //     },
    //     // NEW: A dummy user waiting for Admin approval!
    //     {
    //     id: 'u4',
    //     name: 'New Guy',
    //     email: 'newguy@tms.com',
    //     password: 'password123',
    //     role: 'Pending', 
    //     status: 'Pending'
    //     }
    // ];

    // We keep this to store the active session data!
  currentUser: User | null = null;

    // We can keep the dummy events for now until we move them to MongoDB
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

    // --- LIVE DATABASE CONNECTIONS ---

  // AUTHENTICATION: Send email/password to the Node.js Ticket Booth
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  // AUTHENTICATION: Register a brand new user
  signupUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData);
  }

  // TOKENS: Send a new token to the Node.js backend
  saveTokenToDB(tokenData: any): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/tokens`, tokenData);
  }

  // TOKENS: Fetch a student's tokens from the Node.js backend
  getTokensFromDB(userId: string): Observable<Token[]> {
    return this.http.get<Token[]>(`${this.apiUrl}/tokens/${userId}`);
  }
}

// 2. An empty array to store the tokens as they are generated
//   tokens: Token[] = [];

    // ADD THIS LINE: Save the session!


//     // --- LIVE DATABASE CONNECTIONS (Tokens) ---

//   // CREATE: Send a new token to the Node.js backend
//   saveTokenToDB(tokenData: any): Observable<Token> {
//     return this.http.post<Token>(`${this.apiUrl}/tokens`, tokenData);
//   }

//   // READ: Fetch a student's tokens from the Node.js backend
//   getTokensFromDB(userId: string): Observable<Token[]> {
//     return this.http.get<Token[]>(`${this.apiUrl}/tokens/${userId}`);
//   }
// }
