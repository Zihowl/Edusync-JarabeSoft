import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

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
    imports: [
        CommonModule,
        FormsModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonList,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonIcon
    ],
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
            <div class="container config-container">

                <h3>Ciclo Escolar</h3>
                <form class="card mb-4 bg-dark text-white border-secondary">
                    <div class="card-body d-flex gap-2 justify-content-between align-items-center border-opacity-0 flex-wrap">
                        <div class="d-flex gap-2 align-items-center  flex-column col-lg-4 col-12 flex-grow-1">
                            <label class="mb-0 text-white">Fecha inicio</label>
                            <input type="date" class="form-control bg-dark text-white" [(ngModel)]="newSchoolYearStart" name="startDate">
                        </div>
                        <div class="d-flex gap-2 align-items-center  flex-column col-lg-4 col-12 flex-grow-1">
                            <label class="mb-0 text-white">Fecha de cierre</label>
                            <input type="date" class="form-control bg-dark text-white" [(ngModel)]="newSchoolYearEnd" name="endDate">
                        </div>
                        <div class="col-lg-2 col-12">
                            <button class="btn btn-primary w-100" (click)="AddSchoolYear()" [disabled]="!newSchoolYearStart || !newSchoolYearEnd">
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
                <br>
                <h3>Dominios Permitidos</h3>
                <div class="card mb-4 bg-dark text-white border-secondary">
                    <div class="card-body d-flex gap-2">
                        <input
                            type="text"
                            class="form-control bg-dark text-white border-secondary"
                            [(ngModel)]="newDomain"
                            placeholder="ej: ceti.mx"
                            (keyup.enter)="AddDomain()">
                        <button class="btn btn-primary" (click)="AddDomain()" [disabled]="!newDomain">
                            Agregar
                        </button>
                    </div>
                </div>

                <hr class="" style="margin: 1.1rem 0 1.3rem;">
            
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
    `,
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit
{
    private apollo = inject(Apollo);

    domains: any[] = [];
    newDomain: string = '';
    newSchoolYearStart: string = '';
    newSchoolYearEnd: string = '';

    ngOnInit() 
    {
      addIcons({ trashOutline });
        this.LoadDomains();
    }

    LoadDomains() 
    {
        this.apollo.watchQuery<any>({ query: GET_DOMAINS })
            .valueChanges.subscribe(({ data }) =>
            {
                this.domains = data.GetAllowedDomains;
            });
    }

    AddDomain() 
    {
      if (!this.newDomain)
      {
        return;
      }
        
        this.apollo.mutate({
            mutation: ADD_DOMAIN,
            variables: { domain: this.newDomain },
            refetchQueries: [{ query: GET_DOMAINS }]
        }).subscribe({
        next: () =>
        {
                this.newDomain = '';
            },
            error: (err) => alert('Error al agregar dominio: ' + err.message)
        });
    }

    AddSchoolYear()
    {
        if (!this.newSchoolYearStart || !this.newSchoolYearEnd)
        {
            return;
        }

        // TODO: Implement backend call to save the school year range
        alert('Ciclo escolar agregado: ' + this.newSchoolYearStart + ' - ' + this.newSchoolYearEnd);

        this.newSchoolYearStart = '';
        this.newSchoolYearEnd = '';
    }

    RemoveDomain(id: number) 
    {
      if (!confirm('¿Eliminar este dominio?'))
      {
        return;
      }

        this.apollo.mutate(
        {
            mutation: REMOVE_DOMAIN,
            variables: { id: parseInt(id.toString()) },
            refetchQueries: [{ query: GET_DOMAINS }]
        }).subscribe();
    }
}
