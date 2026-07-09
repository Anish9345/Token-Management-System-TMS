import { Injectable} from '@angular/core';
import { Coupon, Event, User } from '../models';

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
        { id: 'e1', name: 'Tech Symposium 2026', date: new Date('2026-08-25') },
        { id: 'e2', name: 'Guest Lecture: Security', date: new Date('2026-09-10') }
    ];

    coupons: Coupon[] = [];

    constructor() {}

    // 2. We will add methods here later (like login(), createCoupon(), etc.)
}
