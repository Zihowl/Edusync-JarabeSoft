import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { BootstrapService } from '../auth/services/bootstrap.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), ConfigModule],
    providers: [UsersService, UsersResolver, BootstrapService],
    exports: [UsersService], // Exportamos para usarlo en Auth luego
})
export class UsersModule 
{}
