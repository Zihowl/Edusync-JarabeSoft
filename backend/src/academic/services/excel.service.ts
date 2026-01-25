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
    ) {}

    // Standard: PascalCase
    async ProcessScheduleFile(buffer: Buffer) 
    {
        // 1. Leer el archivo desde memoria
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // 2. Convertir a JSON
        const rawData = xlsx.utils.sheet_to_json(sheet);

        if (rawData.length === 0) 
        {
            throw new BadRequestException('El archivo Excel está vacío.');
        }

        // 3. Iterar y Guardar (Estrategia Transaccional básica)
        let processedCount = 0;
        const errors: string[] = [];

        for (const [index, row] of rawData.entries()) 
        {
            try 
            {
                await this.ImportRow(row);
                processedCount++;
            } 
            catch (error) 
            {
                console.error(`Error en fila ${index + 2}:`, error.message);
                errors.push(`Fila ${index + 2}: ${error.message}`);
            }
        }

        return {
            success: true,
            processed: processedCount,
            errors: errors
        };
    }

    private async ImportRow(row: any) 
    {
        // 1. Helper para conversión segura a String (evita el crash de undefined)
        const getValue = (key: string): string => {
            const val = row[key];
            return (val !== undefined && val !== null) ? val.toString().trim() : '';
        };

        // 2. Extraer datos usando los nombres EXACTOS de las columnas
        const claveMateria = getValue('ClaveMateria');
        const materiaName  = getValue('Materia');
        const noEmpleado   = getValue('NoEmpleado');
        const docenteName  = getValue('Docente');
        const grupoName    = getValue('Grupo');
        const aulaName     = getValue('Aula');
        const edificio     = getValue('Edificio');
        const dia          = getValue('Dia');
        const horaInicio   = getValue('HoraInicio');
        const horaFin      = getValue('HoraFin');

        // 3. DEBUG: Si falla, descomenta esto para ver qué recibe el backend
        // console.log('Fila procesada:', { claveMateria, grupoName, dia, horaInicio, horaFin });

        // 4. Validar campos OBLIGATORIOS para crear un horario
        if (!claveMateria || !grupoName || !dia || !horaInicio) 
        {
            // Lanzamos error mostrando qué datos llegaron para facilitar el arreglo
            throw new Error(`Datos incompletos. Se requiere ClaveMateria, Grupo, Dia y HoraInicio. Recibido: ${JSON.stringify(row)}`);
        }

        // --- ESTRATEGIA FIND OR CREATE ---

        // A. Subject (Materia)
        let subject = await this.subjectRepo.findOneBy({ code: claveMateria });
        if (!subject) 
        {
            subject = this.subjectRepo.create({ 
                code: claveMateria, 
                name: materiaName || 'Materia Sin Nombre' 
            });
            await this.subjectRepo.save(subject);
        }

        // B. Teacher (Docente)
        // Usamos 'SIN_NUM' si viene vacío para no romper la base de datos unique constraint
        const empNum = noEmpleado || 'SIN_NUM_' + Date.now(); 
        let teacher = await this.teacherRepo.findOneBy({ employeeNumber: empNum });
        if (!teacher) 
        {
            teacher = this.teacherRepo.create({ 
                employeeNumber: empNum,
                name: docenteName || 'Docente Por Asignar' 
            });
            await this.teacherRepo.save(teacher);
        }

        // C. Classroom (Aula)
        const finalAula = aulaName || 'VIRTUAL';
        let classroom = await this.classroomRepo.findOneBy({ name: finalAula });
        if (!classroom) 
        {
            classroom = this.classroomRepo.create({ 
                name: finalAula,
                // Al usar || undefined, TypeScript ya no se quejará
                building: edificio || undefined 
            });
            await this.classroomRepo.save(classroom);
        }

        // D. Group (Grupo)
        let group = await this.groupRepo.findOneBy({ name: grupoName });
        if (!group) 
        {
            group = this.groupRepo.create({ name: grupoName });
            await this.groupRepo.save(group);
        }

        // E. Crear el Slot de Horario
        const dayNumber = this.ParseDay(dia);
        
        // Formatear horas (asegurar formato HH:MM)
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
