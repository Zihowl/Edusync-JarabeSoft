import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        // CAMBIO CLAVE: Importamos el archivo de rutas y exportamos la constante 'authRoutes'
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'admin',
        // CAMBIO CLAVE: Importamos 'adminRoutes'
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    },
    {
        path: '',
        redirectTo: 'auth/login', // Redirigir a login por defecto por ahora
        pathMatch: 'full'
    },
    // Comentamos 'public' por ahora si no has creado el archivo public.routes.ts para evitar error
    /*
    {
        path: 'public',
        loadChildren: () => import('./public/public.routes').then(m => m.publicRoutes)
    },
    */
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];