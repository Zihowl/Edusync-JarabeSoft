import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAdminInput } from './dto/create-user.input';

@Resolver(() => User)
export class UsersResolver
{
    constructor(private readonly usersService: UsersService) {}

    @Query(() => [User], { name: 'GetUsers' })
    async GetUsers(): Promise<User[]>
    {
        return await this.usersService.FindAll();
    }

    @Mutation(() => User)
    async CreateAdmin(@Args('input') input: CreateAdminInput): Promise<User>
    {
        return await this.usersService.CreateAdmin(input);
    }
}