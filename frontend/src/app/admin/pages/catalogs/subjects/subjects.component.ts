import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

const GET_SUBJECTS = gql`
    query GetSubjects {
        GetSubjects {
            id
            code
            name
        }
    }
`;

const ADD_SUBJECT = gql`
    mutation CreateSubject($input: CreateSubjectInput!) {
        CreateSubject(input: $input) {
            id
            code
            name
        }
    }
`;

const REMOVE_SUBJECT = gql`
    mutation RemoveSubject($id: Int!) {
        RemoveSubject(id: $id)
    }
`;

@Component({
    selector: 'app-subjects',
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonButton, IonIcon],
    template: `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Catálogo de Materias</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="card mb-4 bg-dark text-white border-secondary">
                <div class="card-body d-flex gap-2">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newCode" placeholder="Clave" (keyup.enter)="AddSubject()">
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newName" placeholder="Nombre" (keyup.enter)="AddSubject()">
                    <button class="btn btn-primary" (click)="AddSubject()" [disabled]="!newCode || !newName">Agregar</button>
                </div>
            </div>

            <ion-list>
                <ion-item *ngFor="let s of subjects">
                    <ion-label>
                        <h2>{{ s.name }}</h2>
                        <p>Clave: {{ s.code }}</p>
                    </ion-label>
                    <ion-button fill="clear" color="danger" slot="end" (click)="RemoveSubject(s.id)">
                        <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                </ion-item>

                <div *ngIf="subjects.length === 0" class="text-center p-5 text-muted">
                    No se encontraron materias.
                </div>
            </ion-list>
        </ion-content>
    `,
    styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit
{
    private apollo = inject(Apollo);

    subjects: any[] = [];
    newCode: string = '';
    newName: string = '';

    ngOnInit() {
        addIcons({ trashOutline });
        this.LoadSubjects();
    }

    LoadSubjects() {
        this.apollo.watchQuery<any>({ query: GET_SUBJECTS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res: any) => {
                const data = res?.data;
                if (!data) {
                    console.error('GetSubjects returned no data:', res);
                    this.subjects = [];
                    return;
                }

                this.subjects = data.GetSubjects ?? [];
            },
            error: (err) => {
                alert('Error al cargar materias: ' + err.message);
            }
        });
    }

    AddSubject() {
        if (!this.newCode || !this.newName) return;
        this.apollo.mutate({
            mutation: ADD_SUBJECT,
            variables: { input: { code: this.newCode, name: this.newName } },
            refetchQueries: [{ query: GET_SUBJECTS }]
        }).subscribe({ next: () => { this.newCode = ''; this.newName = ''; }, error: (err) => alert('Error al crear materia: ' + err.message) });
    }

    RemoveSubject(id: number) {
        if (!confirm('¿Eliminar esta materia?')) return;
        this.apollo.mutate({ mutation: REMOVE_SUBJECT, variables: { id: parseInt(id.toString()) }, refetchQueries: [{ query: GET_SUBJECTS }] }).subscribe();
    }
}
