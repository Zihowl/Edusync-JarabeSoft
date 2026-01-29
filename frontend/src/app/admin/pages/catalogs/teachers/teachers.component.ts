import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, chevronForwardOutline } from 'ionicons/icons';

const GET_TEACHERS = gql`
  query GetTeachers {
    GetTeachers {
      id
      employeeNumber
      name
      email
    }
  }
`;

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonSearchbar],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Catálogo de Docentes</ion-title>
      </ion-toolbar>
      <ion-toolbar color="primary">
        <ion-searchbar placeholder="Buscar maestro..." (ionInput)="Filter($event)"></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        
        <ion-item *ngFor="let t of filteredTeachers" button detail="true">
          <ion-avatar slot="start" class="d-flex align-items-center justify-content-center bg-light text-primary">
            <span class="fs-5 fw-bold">{{ GetInitials(t.name) }}</span>
          </ion-avatar>
          <ion-label>
            <h2>{{ t.name }}</h2>
            <p>No. Empleado: {{ t.employeeNumber }}</p>
          </ion-label>
        </ion-item>

        <div *ngIf="filteredTeachers.length === 0" class="text-center p-5 text-muted">
          <ion-icon name="person-outline" style="font-size: 48px;"></ion-icon>
          <p>No se encontraron docentes.</p>
        </div>

      </ion-list>
    </ion-content>
  `
})
export class TeachersComponent implements OnInit 
{
    private apollo = inject(Apollo);

    teachers: any[] = [];
    filteredTeachers: any[] = [];

    ngOnInit() 
    {
        addIcons({ personOutline, chevronForwardOutline });
        this.LoadTeachers();
    }

    LoadTeachers() 
    {
        console.log('Iniciando petición GetTeachers...'); // <--- Debug

        this.apollo.watchQuery<any>({ query: GET_TEACHERS, fetchPolicy: 'network-only' }) // fetchPolicy asegura no usar caché vieja
            .valueChanges.subscribe({
                next: ({ data }) => {
                    console.log('Datos recibidos:', data); // <--- Debug
                    this.teachers = data.GetTeachers;
                    this.filteredTeachers = [...this.teachers];
                },
                error: (err) => {
                    console.error('ERROR GraphQL:', err); // <--- Debug
                    alert('Error al cargar docentes: ' + err.message);
                }
            });
    }

    Filter(event: any) 
    {
        const query = event.target.value?.toLowerCase() || '';
        this.filteredTeachers = this.teachers.filter(t => 
            t.name.toLowerCase().includes(query) || 
            t.employeeNumber.includes(query)
        );
    }

    GetInitials(name: string): string 
    {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
}
