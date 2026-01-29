import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('subjects')
export class Subject 
{
    @Field(() => ID)
    @PrimaryGeneratedColumn()
        id: number;

    @Field()
    @Column({ unique: true })
        code: string; // Clave oficial de la materia

    @Field()
    @Column()
        name: string;
}
