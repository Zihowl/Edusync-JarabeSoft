import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';

@Injectable()
export class TeachersService 
{
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepo: Repository<Teacher>,
    ) 
    {}

    async FindAll(): Promise<Teacher[]> 
    {
        const all = await this.teacherRepo.find({ order: { name: 'ASC' } });

        // === AGREGAR ESTO ===
        console.log('------------------------------------------------');
        console.log('🔍 [TeachersService] Buscando docentes...');
        console.log(`📊 Total encontrados: ${all.length}`);
        if (all.length > 0) 
        {
            console.log('Ejemplo:', all[0]);
        }
        console.log('------------------------------------------------');
        // ====================

        return all;
    }
}
