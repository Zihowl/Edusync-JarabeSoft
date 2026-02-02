import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { Subject } from './entities/subject.entity';
import { Classroom } from './entities/classroom.entity';
import { Group } from './entities/group.entity';
import { ScheduleSlot } from './entities/schedule-slot.entity';
import { ExcelService } from './services/excel.service';
import { AcademicController } from './academic.controller';
import { TeachersService } from './services/teachers.service';
import { TeachersResolver } from './resolvers/teachers.resolver';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
    imports: [TypeOrmModule.forFeature([Teacher, Subject, Classroom, Group, ScheduleSlot])],
    controllers: [AcademicController],
    providers: [
        ExcelService,
        TeachersService,
        TeachersResolver,
        RolesGuard,
    ],
    exports: [ExcelService],
})
export class AcademicModule
{}
