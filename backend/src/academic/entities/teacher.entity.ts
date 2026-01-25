import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('teachers')
export class Teacher 
{
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ unique: true })
    employeeNumber: string;

    @Field()
    @Column()
    name: string;

    // === CORRECCIÓN AQUÍ ===
    // Agregamos { nullable: true } al decorador @Field
    @Field({ nullable: true }) 
    @Column({ nullable: true })
    email: string;
}
