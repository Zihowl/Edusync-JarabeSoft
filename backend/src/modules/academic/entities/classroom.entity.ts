import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('classrooms')
export class Classroom 
{
    @Field(() => ID)
    @PrimaryGeneratedColumn()
        id: number;

    @Field()
    @Column()
        name: string; // Ej: "Laboratorio A", "Aula 101"

    @Field({ nullable: true })
    @Column({ nullable: true })
    // CAMBIO CLAVE: Agregamos '?' para decirle a TypeScript que puede ser undefined
        building?: string;
}
