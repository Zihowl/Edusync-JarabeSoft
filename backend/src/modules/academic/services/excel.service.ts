import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

// Entidades
import { Teacher } from '../entities/teacher.entity';
import { Subject } from '../entities/subject.entity';
import { Classroom } from '../entities/classroom.entity';
import { Group } from '../entities/group.entity';
import { ScheduleSlot } from '../entities/schedule-slot.entity';

@Injectable()
export class ExcelService 
{
    constructor(
        @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
        @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
        @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
        @InjectRepository(Group) private groupRepo: Repository<Group>,
        @InjectRepository(ScheduleSlot) private scheduleRepo: Repository<ScheduleSlot>,
    ) 
    {}

    // Standard: PascalCase
    async ProcessScheduleFile(buffer: Buffer) 
    {
        // 1. Leer el archivo desde memoria
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 2. Convertir a JSON (tipado seguro)
        // Some xlsx utils are not well typed; allow a small exception here
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const rawData = (xlsx.utils as any).sheet_to_json(sheet) as Array<Record<string, unknown>>;

        if (rawData.length === 0) 
        {
            throw new BadRequestException('El archivo Excel está vacío.');
        }

        // Delegate to smaller function
        return this.ProcessScheduleRows(rawData);
    }

    private async ProcessScheduleRows(rawData: Array<Record<string, unknown>>) 
    {
        const errors: string[] = [];
        let processedCount = 0;

        for (const [index, row] of rawData.entries()) 
        {
            const ok = await this.ProcessSingleRow(index, row, errors);
            if (ok) processedCount++;
        }

        return { success: true, processed: processedCount, errors };
    }

    private async ProcessSingleRow(index: number, row: Record<string, unknown>, errors: string[]): Promise<boolean> 
    {
        try 
        {
            await this.ImportRow(row);
            return true;
        }
        catch (err: unknown) 
        {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Error en fila ${index + 2}:`, msg);
            errors.push(`Fila ${index + 2}: ${msg}`);
            return false;
        }
    }

    private async ImportRow(row: Record<string, unknown>) 
    {
        const parsed = this.getParsedRowValues(row);
        this.EnsureRequiredScheduleFields(parsed, row);

        const subject = await this.findOrCreateSubject(parsed.claveMateria, parsed.materiaName);
        const teacher = await this.findOrCreateTeacher(parsed.noEmpleado, parsed.docenteName);
        const classroom = await this.findOrCreateClassroom(parsed.aulaName, parsed.edificio);
        const group = await this.findOrCreateGroup(parsed.grupoName);

        await this.CreateScheduleSlot(subject, teacher, classroom, group, parsed.dia, parsed.horaInicio, parsed.horaFin);
    }

    private async CreateScheduleSlot(subject: Subject, teacher: Teacher, classroom: Classroom, group: Group, dia: string, horaInicio: string, horaFin: string) 
    {
        const dayNumber = this.ParseDay(dia);
        const start = this.FormatTime(horaInicio);
        const end = this.FormatTime(horaFin);

        const slot = this.scheduleRepo.create({
            subject,
            teacher,
            classroom,
            group,
            dayOfWeek: dayNumber,
            startTime: start,
            endTime: end,
        });

        await this.scheduleRepo.save(slot);
    }

    private normalizeCell(val: unknown): string 
    {
        if (typeof val === 'string') return val.trim();
        if (typeof val === 'number') return String(val).trim();
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') 
        {
            try 
            {
                return JSON.stringify(val); 
            }
            catch 
            {
                return ''; 
            }
        }
        return '';
    }

    private getParsedRowValues(row: Record<string, unknown>) 
    {
        return {
            claveMateria: this.normalizeCell(row['ClaveMateria']),
            materiaName: this.normalizeCell(row['Materia']),
            noEmpleado: this.normalizeCell(row['NoEmpleado']),
            docenteName: this.normalizeCell(row['Docente']),
            grupoName: this.normalizeCell(row['Grupo']),
            aulaName: this.normalizeCell(row['Aula']),
            edificio: this.normalizeCell(row['Edificio']),
            dia: this.normalizeCell(row['Dia']),
            horaInicio: this.normalizeCell(row['HoraInicio']),
            horaFin: this.normalizeCell(row['HoraFin']),
        };
    }

    private EnsureRequiredScheduleFields(parsed: { claveMateria: string; grupoName: string; dia: string; horaInicio: string }, row: Record<string, unknown>) 
    {
        if (!parsed.claveMateria || !parsed.grupoName || !parsed.dia || !parsed.horaInicio) 
        {
            throw new Error(
                `Datos incompletos. Se requiere ClaveMateria, Grupo, Dia y HoraInicio. Recibido: ${JSON.stringify(row)}`,
            );
        }
    }

    private async findOrCreateSubject(code: string, name: string) 
    {
        let subject = await this.subjectRepo.findOneBy({ code });
        if (!subject) 
        {
            subject = this.subjectRepo.create({ code, name: name || 'Materia Sin Nombre' });
            await this.subjectRepo.save(subject);
        }
        return subject;
    }

    private async findOrCreateTeacher(empNumRaw: string, name: string) 
    {
        const empNum = empNumRaw || 'SIN_NUM_' + Date.now();
        let teacher = await this.teacherRepo.findOneBy({ employeeNumber: empNum });
        if (!teacher) 
        {
            teacher = this.teacherRepo.create({ employeeNumber: empNum, name: name || 'Docente Por Asignar' });
            await this.teacherRepo.save(teacher);
        }
        return teacher;
    }

    private async findOrCreateClassroom(name: string, building: string) 
    {
        const finalAula = name || 'VIRTUAL';
        let classroom = await this.classroomRepo.findOneBy({ name: finalAula });
        if (!classroom) 
        {
            classroom = this.classroomRepo.create({ name: finalAula, building: building || undefined });
            await this.classroomRepo.save(classroom);
        }
        return classroom;
    }

    private async findOrCreateGroup(name: string) 
    {
        let group = await this.groupRepo.findOneBy({ name });
        if (!group) 
        {
            group = this.groupRepo.create({ name });
            await this.groupRepo.save(group);
        }
        return group;
    }

    private ParseDay(day: string | number): number 
    {
        if (typeof day === 'number') return day;
        const d = day.toString().toLowerCase().trim();
        if (d.includes('lun')) return 1;
        if (d.includes('mar')) return 2;
        if (d.includes('mié') || d.includes('mie')) return 3;
        if (d.includes('jue')) return 4;
        if (d.includes('vie')) return 5;
        if (d.includes('sáb') || d.includes('sab')) return 6;
        return 0; // Domingo o error
    }

    private FormatTime(time: string | number): string 
    {
        if (time === undefined || time === null) return '00:00:00';
        const t = typeof time === 'number' ? String(time) : time;
        if (!t) return '00:00:00';
        // Si excel manda decimales (ej. 0.5 para 12:00), aquí habría que convertir.
        // Por ahora asumimos texto plano y validamos la presencia de ':'
        return t.includes(':') ? t : '00:00:00';
    }
}
