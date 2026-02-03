import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

const GET_BUILDINGS = gql`
    query GetBuildings {
        GetBuildings {
            id
            name
            description
        }
    }
`;

const ADD_BUILDING = gql`
    mutation CreateBuilding($input: CreateBuildingInput!) {
        CreateBuilding(input: $input) {
            id
            name
            description
        }
    }
`;

const REMOVE_BUILDING = gql`
    mutation RemoveBuilding($id: Int!) {
        RemoveBuilding(id: $id)
    }
`;

@Component({
    selector: 'app-buildings',
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonButton, IonIcon],
    template: `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Catálogo de Edificios</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="card mb-4 bg-dark text-white border-secondary">
                <div class="card-body d-flex gap-2">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newName" placeholder="Nombre del edificio" (keyup.enter)="AddBuilding()">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newDescription" placeholder="Descripción (opcional)" (keyup.enter)="AddBuilding()">
                    <button class="btn btn-primary" (click)="AddBuilding()" [disabled]="!newName">Agregar</button>
                </div>
            </div>

            <ion-list>
                <ion-item *ngFor="let b of buildings">
                    <ion-label>
                        <h2>{{ b.name }}</h2>
                        <p *ngIf="b.description">{{ b.description }}</p>
                    </ion-label>
                    <ion-button fill="clear" color="danger" slot="end" (click)="RemoveBuilding(b.id)">
                        <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                </ion-item>

                <div *ngIf="buildings.length === 0" class="text-center p-5 text-muted">
                    No se encontraron edificios.
                </div>
            </ion-list>
        </ion-content>
    `,
    styleUrls: ['./buildings.component.scss']
})
export class BuildingsComponent implements OnInit
{
    private apollo = inject(Apollo);

    buildings: any[] = [];
    newName: string = '';
    newDescription: string = '';

    ngOnInit() {
        addIcons({ trashOutline });
        this.LoadBuildings();
    }

    LoadBuildings() {
        this.apollo.watchQuery<any>({ query: GET_BUILDINGS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res: any) => {
                const data = res?.data;
                if (!data) {
                    console.error('GetBuildings returned no data:', res);
                    this.buildings = [];
                    return;
                }

                this.buildings = data.GetBuildings ?? [];
            },
            error: (err) => {
                alert('Error al cargar edificios: ' + err.message);
            }
        });
    }

    AddBuilding() {
        if (!this.newName) return;
        this.apollo.mutate({
            mutation: ADD_BUILDING,
            variables: { input: { name: this.newName, description: this.newDescription } },
            refetchQueries: [{ query: GET_BUILDINGS }]
        }).subscribe({ next: () => { this.newName = ''; this.newDescription = ''; }, error: (err) => alert('Error al crear edificio: ' + err.message) });
    }

    RemoveBuilding(id: number) {
        if (!confirm('¿Eliminar este edificio?')) return;
        this.apollo.mutate({ mutation: REMOVE_BUILDING, variables: { id: parseInt(id.toString()) }, refetchQueries: [{ query: GET_BUILDINGS }] }).subscribe();
    }
}
