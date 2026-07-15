import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { StudentDashboard } from './pages/student-dashboard/student-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Home } from './pages/home/home';
import { TeacherDashboard } from './pages/teacher-dashboard/teacher-dashboard';
import { AuthGuard } from './guard/auth.guard';
import { AdminOverview } from './pages/admin-dashboard/admin-overview/admin-overview';
import { AdminEvents } from './pages/admin-dashboard/admin-events/admin-events';
import { AdminUsers } from './pages/admin-dashboard/admin-users/admin-users';
import { AdminTokens } from './pages/admin-dashboard/admin-tokens/admin-tokens';

export const routes: Routes = [
    // { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: "",
        component: Home
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "signup",
        component: Signup
    },
    {
        path: "student",
        component: StudentDashboard,
        canActivate: [AuthGuard],
        data: { requiredRole: 'Student'} // <-- Tell the guard who is allowed!
    },
    {
        path: "teacher",
        component: TeacherDashboard,
        canActivate: [AuthGuard],
        data: { requiredRole: 'Teacher' } // <-- Tell the guard who is allowed!
    },
    {
        path: "admin",
        component: AdminDashboard,
        canActivate: [AuthGuard],
        data: { requiredRole: 'Admin' },
        children: [
            // If they just type /admin, auto-redirect them to /admin/overview
        { path: '', redirectTo: 'overview', pathMatch: 'full' },
        
        // The Child Pages (Loaded inside the Shell)
        { path: 'overview', component: AdminOverview },
        { path: 'events', component: AdminEvents },
        { path: 'users', component: AdminUsers },
        { path: 'tokens', component: AdminTokens }
        ]
    }
];
