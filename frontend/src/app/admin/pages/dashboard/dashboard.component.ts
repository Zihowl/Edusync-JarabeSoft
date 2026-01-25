import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge } from '@ionic/angular/standalone'; // Agregamos IonBadge
import { addIcons } from 'ionicons';
// Agregamos el icono cloudUploadOutline
import { settingsOutline, peopleOutline, logOutOutline, cloudUploadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
      CommonModule, RouterModule,
      IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>EduSync Admin</ion-title>
        <ion-buttons slot="end">
            <ion-badge color="light" class="me-2">{{ role }}</ion-badge>
            <ion-button (click)="Logout()">
                <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="container">
        <h1 class="mb-4">Panel de Control</h1>
        
        <ion-grid>
          <ion-row>
            
            <ng-container *ngIf="role === 'SUPER_ADMIN'">
                <ion-col size="12" size-md="6">
                  <ion-card button routerLink="/admin/config" class="h-100">
                    <ion-card-header>
                      <ion-card-title>
                        <ion-icon name="settings-outline" class="me-2"></ion-icon>
                        Configuración
                      </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      Gestionar ciclo escolar y dominios.
                    </ion-card-content>
                  </ion-card>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <ion-card button routerLink="/admin/users" class="h-100">
                    <ion-card-header>
                      <ion-card-title>
                        <ion-icon name="people-outline" class="me-2"></ion-icon>
                        Usuarios
                      </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      Altas y bajas de administradores.
                    </ion-card-content>
                  </ion-card>
                </ion-col>
            </ng-container>

            <ng-container *ngIf="role === 'ADMIN_HORARIOS'">
                <ion-col size="12" size-md="6">
                  <ion-card button routerLink="/admin/upload" class="h-100" color="tertiary">
                    <ion-card-header>
                      <ion-card-title>
                        <ion-icon name="cloud-upload-outline" class="me-2"></ion-icon>
                        Carga de Horarios
                      </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      Importar archivos Excel masivos.
                    </ion-card-content>
                  </ion-card>
                </ion-col>
                
                <ion-col size="12" size-md="6">
                  <ion-card button routerLink="/admin/catalogs/teachers" class="h-100" color="light">
                    <ion-card-header>
                      <ion-card-title>Docentes</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>Ver lista de maestros importados.</ion-card-content>
                  </ion-card>
                </ion-col>
            </ng-container>

          </ion-row>
        </ion-grid>

      </div>
    </ion-content>
  `
})
export class DashboardComponent implements OnInit
{
    role: string | null = '';

    constructor(private authService: AuthService, private router: Router) 
    {
        addIcons({ settingsOutline, peopleOutline, logOutOutline, cloudUploadOutline });
    }

    ngOnInit() 
    {
        this.role = this.authService.GetUserRole();
        
        // === AGREGA ESTO PARA DIAGNOSTICAR ===
        console.log('Rol detectado:', this.role);
        console.log('¿Es Super Admin?', this.role === 'SUPER_ADMIN');
        // =====================================
    }

    Logout() 
    { 
        this.authService.Logout(); 
    }
}
