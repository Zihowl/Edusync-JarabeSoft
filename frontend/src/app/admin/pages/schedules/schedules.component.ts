import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import {
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonList, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonButton, IonIcon, IonFab, IonFabButton,
    IonModal, IonInput, IonFooter, IonSearchbar, IonChip,
    IonSegment, IonSegmentButton, IonBadge, IonToggle, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    trashOutline, addOutline, pencilOutline, calendarOutline,
    timeOutline, personOutline, bookOutline, businessOutline,
    layersOutline, checkmarkCircleOutline, closeCircleOutline,
    eyeOutline, eyeOffOutline
} from 'ionicons/icons';

const GET_SCHEDULES = gql`
    query GetSchedules($filter: ScheduleFilterInput) {
        GetSchedules(filter: $filter) {
            id
            dayOfWeek
            startTime
            endTime
            subgroup
            isPublished
            teacher { id name }
            subject { id name }
            classroom { id name }
            group { id name parent { id name } }
            createdAt
        }
    }
`;

const GET_CATALOGS = gql`
    query GetCatalogs {
        GetTeachers { id name }
        GetSubjects { id name }
        GetClassrooms { id name }
        GetGroups { id name parent { id name } }
    }
`;

const CREATE_SCHEDULE = gql`
    mutation CreateScheduleSlot($input: CreateScheduleSlotInput!) {
        CreateScheduleSlot(input: $input) {
            id
            dayOfWeek
            startTime
            endTime
            isPublished
        }
    }
`;

const UPDATE_SCHEDULE = gql`
    mutation UpdateScheduleSlot($input: UpdateScheduleSlotInput!) {
        UpdateScheduleSlot(input: $input) {
            id
            dayOfWeek
            startTime
            endTime
            isPublished
        }
    }
`;

const REMOVE_SCHEDULE = gql`
    mutation RemoveScheduleSlot($id: Int!) {
        RemoveScheduleSlot(id: $id)
    }
`;

const SET_PUBLISHED = gql`
    mutation SetSchedulesPublished($ids: [Int!]!, $isPublished: Boolean!) {
        SetSchedulesPublished(ids: $ids, isPublished: $isPublished)
    }
`;

const DAYS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
    selector: 'app-schedules',
    standalone: true,
    imports: [
        CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
        IonTitle, IonButtons, IonBackButton, IonList, IonItem, IonLabel,
        IonSelect, IonSelectOption, IonButton, IonIcon, IonFab, IonFabButton,
        IonModal, IonInput, IonFooter, IonSearchbar, IonChip,
        IonSegment, IonSegmentButton, IonBadge, IonToggle, IonNote
    ],
    template: `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Horarios</ion-title>
                <ion-buttons slot="end">
                    <ion-button (click)="PublishSelected()" [disabled]="selectedIds.size === 0">
                        <ion-icon name="eye-outline" slot="start"></ion-icon>
                        Publicar
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <ion-segment [(ngModel)]="filterPublished" (ionChange)="LoadSchedules()">
                    <ion-segment-button value="all">Todos</ion-segment-button>
                    <ion-segment-button value="published">Publicados</ion-segment-button>
                    <ion-segment-button value="draft">Borradores</ion-segment-button>
                </ion-segment>
            </ion-toolbar>
            <ion-toolbar>
                <ion-select [(ngModel)]="filterGroupId" (ionChange)="LoadSchedules()" placeholder="Filtrar por grupo" interface="popover" class="ion-margin-start">
                    <ion-select-option [value]="null">Todos los grupos</ion-select-option>
                    <ion-select-option *ngFor="let g of groups" [value]="g.id">
                        {{ g.parent ? g.parent.name + '-' : '' }}{{ g.name }}
                    </ion-select-option>
                </ion-select>
                <ion-select [(ngModel)]="filterDay" (ionChange)="LoadSchedules()" placeholder="Día" interface="popover">
                    <ion-select-option [value]="null">Todos los días</ion-select-option>
                    <ion-select-option *ngFor="let d of [1,2,3,4,5,6,7]" [value]="d">{{ getDayName(d) }}</ion-select-option>
                </ion-select>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-list lines="full">
                <ion-item *ngFor="let s of schedules" [class.published]="s.isPublished">
                    <ion-icon name="calendar-outline" slot="start" [color]="s.isPublished ? 'success' : 'medium'"></ion-icon>
                    <ion-label>
                        <h2 class="fw-bold">
                            {{ s.subject.name }}
                            <ion-badge [color]="s.isPublished ? 'success' : 'warning'" class="ms-2">
                                {{ s.isPublished ? 'Publicado' : 'Borrador' }}
                            </ion-badge>
                        </h2>
                        <p>
                            <ion-icon name="time-outline" class="inline-icon"></ion-icon>
                            {{ getDayName(s.dayOfWeek) }} {{ s.startTime }} - {{ s.endTime }}
                        </p>
                        <p>
                            <ion-icon name="person-outline" class="inline-icon"></ion-icon>
                            {{ s.teacher.name }}
                        </p>
                        <p>
                            <ion-icon name="layers-outline" class="inline-icon"></ion-icon>
                            {{ s.group.parent ? s.group.parent.name + '-' : '' }}{{ s.group.name }}
                            <span *ngIf="s.subgroup" class="text-muted">({{ s.subgroup }})</span>
                        </p>
                        <p>
                            <ion-icon name="business-outline" class="inline-icon"></ion-icon>
                            {{ s.classroom.name }}
                        </p>
                    </ion-label>
                    <ion-buttons slot="end">
                        <ion-button [color]="s.isPublished ? 'warning' : 'success'" (click)="TogglePublish(s)">
                            <ion-icon [name]="s.isPublished ? 'eye-off-outline' : 'eye-outline'" slot="icon-only"></ion-icon>
                        </ion-button>
                        <ion-button color="medium" (click)="OpenModal(s)">
                            <ion-icon name="pencil-outline" slot="icon-only"></ion-icon>
                        </ion-button>
                        <ion-button color="danger" (click)="Remove(s.id)">
                            <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-item>
            </ion-list>

            <div *ngIf="schedules.length === 0" class="ion-text-center ion-padding mt-5 opacity-50">
                <ion-icon name="calendar-outline" style="font-size: 64px;"></ion-icon>
                <p>No hay horarios registrados</p>
            </div>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button (click)="OpenModal()">
                    <ion-icon name="add-outline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <!-- Modal de creación/edición -->
            <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false">
                <ng-template>
                    <ion-header>
                        <ion-toolbar color="primary">
                            <ion-title>{{ editingItem ? 'Editar' : 'Nuevo' }} Horario</ion-title>
                            <ion-buttons slot="end">
                                <ion-button (click)="isModalOpen = false">Cerrar</ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                    </ion-header>
                    <ion-content class="ion-padding">
                        <ion-list>
                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Grupo</ion-label>
                                <ion-select [(ngModel)]="formData.groupId" interface="popover">
                                    <ion-select-option *ngFor="let g of groups" [value]="g.id">
                                        {{ g.parent ? g.parent.name + '-' : '' }}{{ g.name }}
                                    </ion-select-option>
                                </ion-select>
                                <ion-icon name="layers-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Materia</ion-label>
                                <ion-select [(ngModel)]="formData.subjectId" interface="popover">
                                    <ion-select-option *ngFor="let s of subjects" [value]="s.id">{{ s.name }}</ion-select-option>
                                </ion-select>
                                <ion-icon name="book-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Docente</ion-label>
                                <ion-select [(ngModel)]="formData.teacherId" interface="popover">
                                    <ion-select-option *ngFor="let t of teachers" [value]="t.id">{{ t.name }}</ion-select-option>
                                </ion-select>
                                <ion-icon name="person-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Aula</ion-label>
                                <ion-select [(ngModel)]="formData.classroomId" interface="popover">
                                    <ion-select-option *ngFor="let c of classrooms" [value]="c.id">{{ c.name }}</ion-select-option>
                                </ion-select>
                                <ion-icon name="business-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Día de la semana</ion-label>
                                <ion-select [(ngModel)]="formData.dayOfWeek" interface="popover">
                                    <ion-select-option *ngFor="let d of [1,2,3,4,5,6,7]" [value]="d">{{ getDayName(d) }}</ion-select-option>
                                </ion-select>
                                <ion-icon name="calendar-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Hora de inicio</ion-label>
                                <ion-input type="time" [(ngModel)]="formData.startTime"></ion-input>
                                <ion-icon name="time-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Hora de fin</ion-label>
                                <ion-input type="time" [(ngModel)]="formData.endTime"></ion-input>
                                <ion-icon name="time-outline" slot="start"></ion-icon>
                            </ion-item>

                            <ion-item fill="outline" class="mb-3">
                                <ion-label position="stacked">Subgrupo (opcional)</ion-label>
                                <ion-input [(ngModel)]="formData.subgroup" placeholder="Ej. A, B, Desarrollo..."></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-label>Publicar inmediatamente</ion-label>
                                <ion-toggle [(ngModel)]="formData.isPublished" slot="end"></ion-toggle>
                            </ion-item>
                        </ion-list>
                    </ion-content>
                    <ion-footer class="ion-padding">
                        <ion-button expand="block" (click)="Save()" [disabled]="!isFormValid()">
                            {{ editingItem ? 'Actualizar' : 'Guardar' }}
                        </ion-button>
                    </ion-footer>
                </ng-template>
            </ion-modal>
        </ion-content>
    `,
    styles: [`
        ion-item { --padding-start: 16px; }
        .mb-3 { margin-bottom: 1rem; }
        .inline-icon { font-size: 14px; margin-right: 4px; vertical-align: middle; }
        .ms-2 { margin-left: 0.5rem; }
        .published { --background: rgba(var(--ion-color-success-rgb), 0.05); }
        ion-segment { padding: 8px; }
    `]
})
export class SchedulesComponent implements OnInit
{
    private apollo = inject(Apollo);

    schedules: any[] = [];
    teachers: any[] = [];
    subjects: any[] = [];
    classrooms: any[] = [];
    groups: any[] = [];

    filterPublished: 'all' | 'published' | 'draft' = 'all';
    filterGroupId: number | null = null;
    filterDay: number | null = null;

    selectedIds = new Set<number>();
    isModalOpen = false;
    editingItem: any = null;

    formData = {
        groupId: null as number | null,
        subjectId: null as number | null,
        teacherId: null as number | null,
        classroomId: null as number | null,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        subgroup: '',
        isPublished: false
    };

    ngOnInit()
    {
        addIcons({
            trashOutline, addOutline, pencilOutline, calendarOutline,
            timeOutline, personOutline, bookOutline, businessOutline,
            layersOutline, checkmarkCircleOutline, closeCircleOutline,
            eyeOutline, eyeOffOutline
        });
        this.LoadCatalogs();
        this.LoadSchedules();
    }

    getDayName(day: number): string
    {
        return DAYS[day] || '';
    }

    LoadCatalogs()
    {
        this.apollo.watchQuery<any>({ query: GET_CATALOGS, fetchPolicy: 'network-only' }).valueChanges.subscribe({
            next: (res) => {
                this.teachers = res.data?.GetTeachers ?? [];
                this.subjects = res.data?.GetSubjects ?? [];
                this.classrooms = res.data?.GetClassrooms ?? [];
                this.groups = res.data?.GetGroups ?? [];
            }
        });
    }

    LoadSchedules()
    {
        const filter: any = {};
        if (this.filterGroupId) filter.groupId = this.filterGroupId;
        if (this.filterDay) filter.dayOfWeek = this.filterDay;
        if (this.filterPublished === 'published') filter.isPublished = true;
        if (this.filterPublished === 'draft') filter.isPublished = false;

        this.apollo.watchQuery<any>({
            query: GET_SCHEDULES,
            variables: { filter: Object.keys(filter).length > 0 ? filter : null },
            fetchPolicy: 'network-only'
        }).valueChanges.subscribe({
            next: (res) => {
                this.schedules = res.data?.GetSchedules ?? [];
            },
            error: (err) => console.error('Error loading schedules:', err)
        });
    }

    OpenModal(item: any = null)
    {
        this.editingItem = item;
        if (item) {
            this.formData = {
                groupId: Number(item.group.id),
                subjectId: Number(item.subject.id),
                teacherId: Number(item.teacher.id),
                classroomId: Number(item.classroom.id),
                dayOfWeek: item.dayOfWeek,
                startTime: item.startTime.substring(0, 5),
                endTime: item.endTime.substring(0, 5),
                subgroup: item.subgroup || '',
                isPublished: item.isPublished
            };
        } else {
            this.formData = {
                groupId: null,
                subjectId: null,
                teacherId: null,
                classroomId: null,
                dayOfWeek: 1,
                startTime: '08:00',
                endTime: '09:00',
                subgroup: '',
                isPublished: false
            };
        }
        this.isModalOpen = true;
    }

    isFormValid(): boolean
    {
        return !!(
            this.formData.groupId &&
            this.formData.subjectId &&
            this.formData.teacherId &&
            this.formData.classroomId &&
            this.formData.dayOfWeek &&
            this.formData.startTime &&
            this.formData.endTime &&
            this.formData.startTime < this.formData.endTime
        );
    }

    Save()
    {
        if (!this.isFormValid()) return;

        const input: any = {
            groupId: this.formData.groupId,
            subjectId: this.formData.subjectId,
            teacherId: this.formData.teacherId,
            classroomId: this.formData.classroomId,
            dayOfWeek: this.formData.dayOfWeek,
            startTime: this.formData.startTime,
            endTime: this.formData.endTime,
            subgroup: this.formData.subgroup || null,
            isPublished: this.formData.isPublished
        };

        if (this.editingItem) {
            input.id = Number(this.editingItem.id);
            this.apollo.mutate({
                mutation: UPDATE_SCHEDULE,
                variables: { input }
            }).subscribe({
                next: () => {
                    this.isModalOpen = false;
                    this.LoadSchedules();
                },
                error: (err) => alert('Error: ' + err.message)
            });
        } else {
            this.apollo.mutate({
                mutation: CREATE_SCHEDULE,
                variables: { input }
            }).subscribe({
                next: () => {
                    this.isModalOpen = false;
                    this.LoadSchedules();
                },
                error: (err) => alert('Error: ' + err.message)
            });
        }
    }

    Remove(id: number)
    {
        if (!confirm('¿Eliminar este horario?')) return;

        this.apollo.mutate({
            mutation: REMOVE_SCHEDULE,
            variables: { id }
        }).subscribe({
            next: () => this.LoadSchedules(),
            error: (err) => alert('Error: ' + err.message)
        });
    }

    TogglePublish(schedule: any)
    {
        this.apollo.mutate({
            mutation: SET_PUBLISHED,
            variables: { ids: [Number(schedule.id)], isPublished: !schedule.isPublished }
        }).subscribe({
            next: () => this.LoadSchedules(),
            error: (err) => alert('Error: ' + err.message)
        });
    }

    PublishSelected()
    {
        if (this.selectedIds.size === 0) return;
        const ids = Array.from(this.selectedIds);

        this.apollo.mutate({
            mutation: SET_PUBLISHED,
            variables: { ids, isPublished: true }
        }).subscribe({
            next: () => {
                this.selectedIds.clear();
                this.LoadSchedules();
            },
            error: (err) => alert('Error: ' + err.message)
        });
    }
}
