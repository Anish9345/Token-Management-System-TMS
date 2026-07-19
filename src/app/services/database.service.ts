import { inject, Injectable} from '@angular/core';
import { Event, Token, User } from '../models';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, lastValueFrom } from 'rxjs';

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

  

    // // We can keep the dummy events for now until we move them to MongoDB
    // events: Event[] = [
    //     {
    //         id: 'evt_1', 
    //         name: 'Cybersecurity CTF Championship', 
    //         // Wrap the string in new Date()
    //         date: new Date('2026-08-15'), 
    //         // Changed description to location
    //         location: 'Main Security Lab',
    //         // description: 'Annual Capture The Flag event.'
    //     },
    //     {
    //         id: 'evt_3', 
    //         name: 'Hackathon: AI Solutions', 
    //         // Wrap the string in new Date()
    //         date: new Date('2026-10-05'), 
    //         // Changed description to location
    //         location: 'Innovation Auditorium',
    //         // description: '48-hour coding challenge.' 
    //     }
    // ];

    // --- LIVE DATABASE CONNECTIONS ---

  // --- AUTHENTICATION ---
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  signupUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData);
  }

  // Fetch profile for persistent login
  loadUserProfile(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => this.currentUser = user),
      catchError(() => {
        this.currentUser = null;
        localStorage.removeItem('tms_token');
        return of(null);
      })
    );
  }

  // --- TOKENS (Student) ---
  saveTokenToDB(tokenData: any): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/tokens`, tokenData);
  }

  getTokensFromDB(userId: string): Observable<Token[]> {
    return this.http.get<Token[]>(`${this.apiUrl}/tokens/user/${userId}`);
  }

  // --- TEACHER ENDPOINTS ---
  searchTokenByString(tokenString: string): Observable<Token> {
    return this.http.get<Token>(`${this.apiUrl}/tokens/search/${tokenString}`);
  }

  markTokenAsUsed(tokenId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tokens/${tokenId}/use`, {});
  }

  // --- ADMIN ENDPOINTS - USERS ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUser(userId: string, updateData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, updateData);
  }

  // --- ADMIN ENDPOINTS - EVENTS ---
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`);
  }

  createEvent(eventData: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, eventData);
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/events/${eventId}`, eventData);
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${eventId}`);
  }

  // --- ADMIN ENDPOINTS - TOKENS ---
  getAllTokens(): Observable<Token[]> {
    return this.http.get<Token[]>(`${this.apiUrl}/tokens`);
  }

  revokeToken(tokenId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tokens/${tokenId}/revoke`, {});
  }

  deleteAllTokens(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tokens`);
  }
}

// Factory function for APP_INITIALIZER
export function initializeApp(db: DatabaseService) {
  return () => {
    const token = localStorage.getItem('tms_token');
    if (token) {
      return lastValueFrom(db.loadUserProfile());
    }
    return Promise.resolve();
  };
}