import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { StudentDashboard } from './pages/student-dashboard/student-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Home } from './pages/home/home';
import { TeacherDashboard } from './pages/teacher-dashboard/teacher-dashboard';

export const routes: Routes = [
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
        component: StudentDashboard
    },
    {
        path: "teacher",
        component: TeacherDashboard
    },
    {
        path: "admin",
        component: AdminDashboard
    }
];
