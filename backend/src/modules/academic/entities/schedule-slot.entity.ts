import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Subject } from './subject.entity';
import { Classroom } from './classroom.entity';
import { Group } from './group.entity';

@ObjectType()
@Entity('schedule_slots')
export class ScheduleSlot
{
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Teacher)
    @ManyToOne(() => Teacher, { eager: true })
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @Field(() => Subject)
    @ManyToOne(() => Subject, { eager: true })
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @Field(() => Classroom)
    @ManyToOne(() => Classroom, { eager: true })
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;

    @Field(() => Group)
    @ManyToOne(() => Group, { eager: true })
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @Field(() => Int)
    @Column()
    dayOfWeek: number;

    @Field()
    @Column({ type: 'time' })
    startTime: string;

    @Field()
    @Column({ type: 'time' })
    endTime: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    subgroup: string;
}
