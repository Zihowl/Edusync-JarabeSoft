import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

const GET_GROUPS = gql`
    query GetGroups {
        GetGroups {
            id
            name
            parent {
                id
                name
            }
        }
    }
`;

const ADD_GROUP = gql`
    mutation CreateGroup($input: CreateGroupInput!) {
        CreateGroup(input: $input) {
            id
            name
        }
    }
`;

const REMOVE_GROUP = gql`
    mutation RemoveGroup($id: Int!) {
        RemoveGroup(id: $id)
    }
`;

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon],
    template: `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Catálogo de Grupos</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="card mb-4 bg-dark text-white border-secondary">
                <div class="card-body d-flex gap-2">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newName" placeholder="Nombre del grupo" (keyup.enter)="AddGroup()">
                    <ion-select placeholder="Grupo padre (opcional)" interface="popover" [(ngModel)]="newParentId">
                        <ion-select-option *ngFor="let g of groups" [value]="g.id">{{ g.name }}</ion-select-option>
                    </ion-select>
                    <button class="btn btn-primary" (click)="AddGroup()" [disabled]="!newName">Agregar</button>
                </div>
            </div>

            <ion-list>
                <ion-item *ngFor="let g of groups">
                    <ion-label>
                        <h2>{{ g.name }}</h2>
                        <p *ngIf="g.parent">Padre: {{ g.parent.name }}</p>
                    </ion-label>
                    <ion-button fill="clear" color="danger" slot="end" (click)="RemoveGroup(g.id)">
                        <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                </ion-item>

                <div *ngIf="groups.length === 0" class="text-center p-5 text-muted">
                    No se encontraron grupos.
                </div>
            </ion-list>
        </ion-content>
    `,
    styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit
{
    private apollo = inject(Apollo);

    groups: any[] = [];
    newName: string = '';
    newParentId: number | null = null;

    ngOnInit() {
        addIcons({ trashOutline });
        this.LoadGroups();
    }

    LoadGroups() {
        this.apollo.watchQuery<any>({ query: GET_GROUPS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res: any) => {
                const data = res?.data;
                if (!data) {
                    console.error('GetGroups returned no data:', res);
                    this.groups = [];
                    return;
                }

                this.groups = data.GetGroups ?? [];
            },
            error: (err) => {
                alert('Error al cargar grupos: ' + err.message);
            }
        });
    }

    AddGroup() {
        if (!this.newName) return;
        this.apollo.mutate({
            mutation: ADD_GROUP,
            variables: { input: { name: this.newName, parentId: this.newParentId } },
            refetchQueries: [{ query: GET_GROUPS }]
        }).subscribe({ next: () => { this.newName = ''; this.newParentId = null; }, error: (err) => alert('Error al crear grupo: ' + err.message) });
    }

    RemoveGroup(id: number) {
        if (!confirm('¿Eliminar este grupo?')) return;
        this.apollo.mutate({ mutation: REMOVE_GROUP, variables: { id: parseInt(id.toString()) }, refetchQueries: [{ query: GET_GROUPS }] }).subscribe();
    }
}
