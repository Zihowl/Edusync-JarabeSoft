import { Resolver, Query } from '@nestjs/graphql';
import { Teacher } from '../entities/teacher.entity';
import { TeachersService } from '../services/teachers.service';

@Resolver(() => Teacher)
export class TeachersResolver 
{
    constructor(private readonly teachersService: TeachersService) {}

    @Query(() => [Teacher], { name: 'GetTeachers' })
    async GetTeachers(): Promise<Teacher[]> 
    {
        return await this.teachersService.FindAll();
    }
}
