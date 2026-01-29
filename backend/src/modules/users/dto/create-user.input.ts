import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAdminInput 
{
    @Field()
    @IsNotEmpty()
        fullName: string;

    @Field()
    @IsEmail()
        email: string;
}
