export type Role = 'Student' | 'Teacher' | 'Admin' | 'Pending';

// NEW: Add a strict status type
export type UserStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User{
    // id: string;
    id?: string; // Add this mapping if you haven't already
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    status: UserStatus; // <-- ADD THIS LINE
}

export interface Event{
    // id: string;
    id?: string;    // Local helper ID
    _id?: string;   // MongoDB Database ID
    name: string;
    date: Date;
    location: string;
    // description: string;
}

export interface Token{
    // id: string;
    id?: string;    // Local helper ID
    _id?: string;   // MongoDB Database ID               
    tokenString: string;      
    userId: string;           // Points directly to the User who made it
    eventId: string;          // Points directly to the Event
    createdAt: Date;
    expiresAt: Date;
    status: 'Active' | 'Expired' | 'Used';
}