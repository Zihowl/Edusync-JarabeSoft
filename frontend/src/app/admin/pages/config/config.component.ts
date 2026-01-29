import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addCircleOutline } from 'ionicons/icons';

// Consultas GraphQL
const GET_DOMAINS = gql`
  query GetAllowedDomains {
    GetAllowedDomains {
      id
      domain
    }
  }
`;

const ADD_DOMAIN = gql`
  mutation CreateAllowedDomain($domain: String!) {
    CreateAllowedDomain(domain: $domain) {
      id
      domain
    }
  }
`;

const REMOVE_DOMAIN = gql`
  mutation RemoveAllowedDomain($id: Int!) {
    RemoveAllowedDomain(id: $id)
  }
`;

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Configuración Global</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="container" style="max-width: 600px;">
        
        <div class="card mb-4">
          <div class="card-body d-flex gap-2">
            <input type="text" class="form-control" [(ngModel)]="newDomain" placeholder="ej: tecmm.edu.mx" (keyup.enter)="AddDomain()">
            <button class="btn btn-primary" (click)="AddDomain()" [disabled]="!newDomain">
              Agregar
            </button>
          </div>
        </div>

        <h3>Dominios Permitidos</h3>
        <ion-list>
          <ion-item *ngFor="let d of domains">
            <ion-label>{{ d.domain }}</ion-label>
            <ion-button fill="clear" color="danger" slot="end" (click)="RemoveDomain(d.id)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </ion-item>
          <div *ngIf="domains.length === 0" class="text-center p-3 text-muted">
            No hay dominios registrados.
          </div>
        </ion-list>

      </div>
    </ion-content>
  `
})
export class ConfigComponent implements OnInit 
{
    private apollo = inject(Apollo);

    domains: any[] = [];
    newDomain: string = '';

    ngOnInit() 
    {
        addIcons({ trashOutline, addCircleOutline });
        this.LoadDomains();
    }

    LoadDomains() 
    {
        this.apollo.watchQuery<any>({ query: GET_DOMAINS })
            .valueChanges.subscribe(({ data }) => {
                this.domains = data.GetAllowedDomains;
            });
    }

    AddDomain() 
    {
        if (!this.newDomain) return;
        
        this.apollo.mutate({
            mutation: ADD_DOMAIN,
            variables: { domain: this.newDomain },
            refetchQueries: [{ query: GET_DOMAINS }] // Actualizar lista automáticamente
        }).subscribe({
            next: () => {
                this.newDomain = '';
            },
            error: (err) => alert('Error al agregar dominio: ' + err.message)
        });
    }

    RemoveDomain(id: number) 
    {
        if (!confirm('¿Eliminar este dominio?')) return;

        this.apollo.mutate({
            mutation: REMOVE_DOMAIN,
            variables: { id: parseInt(id.toString()) }, // Asegurar Int
            refetchQueries: [{ query: GET_DOMAINS }]
        }).subscribe();
    }
}
