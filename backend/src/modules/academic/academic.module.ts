import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { Subject } from './entities/subject.entity';
import { Classroom } from './entities/classroom.entity';
import { Group } from './entities/group.entity';
import { ScheduleSlot } from './entities/schedule-slot.entity';
// Servicios y Controladores
import { ExcelService } from './services/excel.service';
import { AcademicController } from './academic.controller';
import { TeachersService } from './services/teachers.service'; // <--- Nuevo
import { TeachersResolver } from './resolvers/teachers.resolver'; // <--- Nuevo

@Module({
    imports: [TypeOrmModule.forFeature([Teacher, Subject, Classroom, Group, ScheduleSlot])],
    controllers: [AcademicController], // <--- Nuevo Endpoint REST
    providers: [
        ExcelService, // <--- Nuevo Servicio
        TeachersService, // <--- Registrar
        TeachersResolver, // <--- Registrar
    ],
    exports: [ExcelService],
})
export class AcademicModule 
{}
