import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Teacher } from '../entities/teacher.entity';
import { TeachersService } from '../services/teachers.service';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => Teacher)
export class TeachersResolver 
{
    constructor(private readonly teachersService: TeachersService) 
    {}

    @Query(() => [Teacher], { name: 'GetTeachers' })
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN_HORARIOS)
    async GetTeachers(): Promise<Teacher[]> 
    {
        return await this.teachersService.FindAll();
    }
}
