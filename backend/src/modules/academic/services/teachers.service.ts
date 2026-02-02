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
        return all;
    }
}
