import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';

// Definición de la Mutación (Tal cual la probaste en el Playground)
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    Login(loginInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        role
        isActive
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AuthService 
{
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'user_data'; // <--- Nueva clave

    private apollo = inject(Apollo);
    private router = inject(Router);

    // Standard: PascalCase
    Login(email: string, password: string): Observable<boolean> 
    {
        return this.apollo.mutate<any>({
            mutation: LOGIN_MUTATION,
            variables: { email, password }
        }).pipe(
            map(result => {
                console.log('Respuesta del Backend:', result); // <--- DEBUG 1

                // A veces es result.data.login (minúscula) o result.data.Login (mayúscula)
                // Usamos ?. para evitar errores si es null
                const data = result.data?.Login || result.data?.login; 
                
                if (data && data.accessToken) 
                {
                    console.log('Guardando Usuario:', data.user); // <--- DEBUG 2
                    this.SaveSession(data.accessToken, data.user); // <--- Pasamos el usuario
                    return true;
                }
                return false;
            })
        );
    }

    Logout() 
    {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY); // <--- Limpiamos usuario
        this.router.navigate(['/auth/login']);
    }

    private SaveSession(token: string, user: any) 
    {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user)); // <--- Guardamos JSON
    }
    
    // Nuevo método para leer el rol
    GetUserRole(): string | null
    {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr).role;
        } catch {
            return null;
        }
    }

    IsAuthenticated(): boolean 
    {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }
}