import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap
{
    private readonly logger = new Logger(BootstrapService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) 
    {}

    async onApplicationBootstrap() 
    {
        await this.CheckAndCreateSuperAdmin();
    }

    private async CheckAndCreateSuperAdmin() 
    {
        const count = await this.userRepository.count();

        if (count === 0) 
        {
            this.logger.warn('Empty database detected. Starting Genesis Protocol...');
            await this.CreateGenesisAdmin();
        }
    }

    private async CreateGenesisAdmin() 
    {
        const randomHex = crypto.randomBytes(4).toString('hex');
        const email = `admin-${randomHex}@setup.local`;

        const { password, hash } = await this.GenerateTempPassword();

        const superAdmin = this.userRepository.create({
            email,
            password: hash,
            fullName: 'Super Administrator',
            role: UserRole.SUPER_ADMIN,
            isTempPassword: true,
            isActive: true,
        });

        await this.userRepository.save(superAdmin);
        this.PrintCredentials(email, password);
    }

    private async GenerateTempPassword() 
    {
        const password = crypto.randomBytes(16).toString('hex') + 'Aa1!';
        const hash = await argon2.hash(password);
        return { password, hash };
    }

    private PrintCredentials(email: string, password: string) 
    {
        console.log('\n==================================================');
        console.log(' SUPER ADMIN TEMPORARY CREDENTIALS');
        console.log('==================================================');
        console.log(` Email:    ${email}`);
        console.log(` Password: ${password}`);
        console.log('==================================================\n');
    }
}
