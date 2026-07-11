import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { StudentDashboard } from './pages/student-dashboard/student-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Home } from './pages/home/home';
import { TeacherDashboard } from './pages/teacher-dashboard/teacher-dashboard';
import { AuthGuard } from './guard/auth.guard';

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
        data: { requiredRole: 'Admin' }
    }
];
