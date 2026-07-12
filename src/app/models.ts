export type Role = 'Student' | 'Teacher' | 'Admin' | 'Pending';

export interface User{
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface Event{
    id: string;
    name: string;
    date: Date;
    location: string;
    // description: string;
}

export interface Token{
    id: string;               
    tokenString: string;      
    userId: string;           // Points directly to the User who made it
    eventId: string;          // Points directly to the Event
    createdAt: Date;
    expiresAt: Date;
    status: 'Active' | 'Expired' | 'Used';
}