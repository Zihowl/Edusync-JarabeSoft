import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const adminRoutes: Routes = [
{
    path: '',
    canActivate: [AuthGuard],
    children: [
    {
        path: '', 
        component: DashboardComponent 
    },
    {   
        path: 'config', 
        loadComponent: () => 
            import('./pages/config/config.component').then(m => m.ConfigComponent)
    },
    {
        path: 'upload', 
        loadComponent: () => 
            import('./pages/upload/upload.component').then(m => m.UploadComponent) 
    },
    {
        path: 'users',
        loadComponent: () => 
            import('./pages/users/users.component').then(m => m.UsersComponent)
    },
    {
        path: 'catalogs/teachers',
        loadComponent: () => 
            import('./pages/catalogs/teachers/teachers.component').then(m => m.TeachersComponent)
    }
    ]
  }
];
