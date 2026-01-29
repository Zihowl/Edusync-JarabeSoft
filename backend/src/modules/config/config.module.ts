import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllowedDomain } from './entities/allowed-domain.entity';
import { ConfigService } from './config.service';
import { ConfigResolver } from './config.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([AllowedDomain])],
    providers: [ConfigService, ConfigResolver],
    exports: [ConfigService],
})
export class ConfigModule 
{}
