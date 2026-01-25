import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
// Importamos módulos de Ionic Standalone si usas componentes visuales de Ionic
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true, // ¡CRUCIAL!
  imports: [
      CommonModule, 
      ReactiveFormsModule,
      // Ionic Imports (opcional si usas Bootstrap puro, pero recomendado dejarlo listo)
      IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonInput, IonItem, IonLabel
  ],
  templateUrl: './login.component.html',
  styles: [] // Usamos array vacío en lugar de un archivo externo
})
export class LoginComponent 
{
    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    // Standard: PascalCase
    OnSubmit() 
    {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password } = this.loginForm.value;

        this.authService.Login(email, password).subscribe({
            next: (success) => {
                this.isLoading = false;
                if (success) 
                {
                    console.log('Login Successful!');
                    // Redirigir al Admin Dashboard
                    this.router.navigate(['/admin']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Credenciales inválidas o error de conexión.';
                console.error(err);
            }
        });
    }
}