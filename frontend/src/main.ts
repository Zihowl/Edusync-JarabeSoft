import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { inject } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

// Archivos del proyecto
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, 
{
    providers: [
    {
        provide: RouteReuseStrategy, useClass: IonicRouteStrategy
    },
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),

        // 1. Configuración HTTP (Soporte para interceptores legacy)
        provideHttpClient(withInterceptorsFromDi()),

        // 2. Registro del AuthInterceptor
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    },

        // 3. Configuración de Apollo GraphQL
        // Usamos provideApollo que registra el servicio 'Apollo' automáticamente
        provideApollo(() => 
    {
        const httpLink = inject(HttpLink);

        return {
        link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
        cache: new InMemoryCache(),
        };
    }),
    ],
});