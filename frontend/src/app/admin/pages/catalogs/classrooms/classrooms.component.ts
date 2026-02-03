import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

const GET_CLASSROOMS = gql`
    query GetClassrooms {
        GetClassrooms {
            id
            name
            building { id name }
        }
    }
`;

const GET_BUILDINGS = gql`
    query GetBuildings {
        GetBuildings { id name }
    }
`;

const ADD_CLASSROOM = gql`
    mutation CreateClassroom($input: CreateClassroomInput!) {
        CreateClassroom(input: $input) {
            id
            name
        }
    }
`;

const REMOVE_CLASSROOM = gql`
    mutation RemoveClassroom($id: Int!) {
        RemoveClassroom(id: $id)
    }
`;

@Component({
    selector: 'app-classrooms',
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon],
    template: `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Catálogo de Aulas</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="card mb-4 bg-dark text-white border-secondary">
                <div class="card-body d-flex gap-2">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newName" placeholder="Nombre del aula" (keyup.enter)="AddClassroom()">
                    <ion-select placeholder="Edificio (opcional)" interface="popover" [(ngModel)]="newBuildingId">
                        <ion-select-option *ngFor="let b of buildings" [value]="b.id">{{ b.name }}</ion-select-option>
                    </ion-select>
                    <button class="btn btn-primary" (click)="AddClassroom()" [disabled]="!newName">Agregar</button>
                </div>
            </div>

            <ion-list>
                <ion-item *ngFor="let c of classrooms">
                    <ion-label>
                        <h2>{{ c.name }}</h2>
                        <p *ngIf="c.building">Edificio: {{ c.building.name }}</p>
                    </ion-label>
                    <ion-button fill="clear" color="danger" slot="end" (click)="RemoveClassroom(c.id)">
                        <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                </ion-item>

                <div *ngIf="classrooms.length === 0" class="text-center p-5 text-muted">
                    No se encontraron aulas.
                </div>
            </ion-list>
        </ion-content>
    `,
    styleUrls: ['./classrooms.component.scss']
})
export class ClassroomsComponent implements OnInit
{
    private apollo = inject(Apollo);

    classrooms: any[] = [];
    buildings: any[] = [];
    newName: string = '';
    newBuildingId: number | null = null;

    ngOnInit() {
        addIcons({ trashOutline });
        this.LoadBuildings();
        this.LoadClassrooms();
    }

    LoadBuildings() {
        this.apollo.watchQuery<any>({ query: GET_BUILDINGS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res: any) => {
                const data = res?.data;
                this.buildings = data?.GetBuildings ?? [];
            },
            error: (err) => {
                console.error('Error loading buildings:', err);
                this.buildings = [];
            }
        });
    }

    LoadClassrooms() {
        this.apollo.watchQuery<any>({ query: GET_CLASSROOMS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res: any) => {
                const data = res?.data;
                if (!data) {
                    console.error('GetClassrooms returned no data:', res);
                    this.classrooms = [];
                    return;
                }

                this.classrooms = data.GetClassrooms ?? [];
            },
            error: (err) => {
                alert('Error al cargar aulas: ' + err.message);
            }
        });
    }

    AddClassroom() {
        if (!this.newName) return;
        this.apollo.mutate({
            mutation: ADD_CLASSROOM,
            variables: { input: { name: this.newName, buildingId: this.newBuildingId } },
            refetchQueries: [{ query: GET_CLASSROOMS }]
        }).subscribe({ next: () => { this.newName = ''; this.newBuildingId = null; }, error: (err) => alert('Error al crear aula: ' + err.message) });
    }

    RemoveClassroom(id: number) {
        if (!confirm('¿Eliminar esta aula?')) return;
        this.apollo.mutate({ mutation: REMOVE_CLASSROOM, variables: { id: parseInt(id.toString()) }, refetchQueries: [{ query: GET_CLASSROOMS }] }).subscribe();
    }
}
