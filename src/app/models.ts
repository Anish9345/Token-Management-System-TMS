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
}

export interface Coupon{
    id: string;
    eventId: string;
    generatedByStudentId: string;
    generatedAt: Date;
    expiresAt: Date;
    isUsed: boolean;
    isValid: boolean;
}