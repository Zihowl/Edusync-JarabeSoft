import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateAdminInput } from './dto/create-user.input';
import { ConfigService } from '../config/config.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class UsersService
{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) 
    {}

    async FindAll(): Promise<User[]> 
    {
        return await this.userRepository.find();
    }

    async FindOneByEmail(email: string): Promise<User | null> 
    {
        return await this.userRepository.findOneBy({ email });
    }

    async CreateAdmin(input: CreateAdminInput): Promise<User> 
    {
        await this.EnsureNotExists(input.email);
        await this.EnsureDomainAllowed(input.email);
        const tempPassword = this.GenerateTempPassword();
        const hash = await argon2.hash(tempPassword);
        const savedUser = await this.CreateAndSaveAdmin(input, hash);
        this.SendWelcomeEmail(input.email, tempPassword);

        return savedUser;
    }

    private async EnsureNotExists(email: string) 
    {
        const existing = await this.userRepository.findOneBy({ email });
        if (existing) 
        {
            throw new ConflictException('El correo ya está registrado.');
        }
    }

    private async EnsureDomainAllowed(email: string) 
    {
        const parts = email.split('@');
        if (parts.length !== 2) throw new BadRequestException('Email inválido');
        const domain = parts[1];
        const allowedDomains = await this.configService.getAllowedDomains();
        const isAllowed = allowedDomains.some(d => d.domain === domain);
        if (!isAllowed) 
        {
            throw new BadRequestException(
                `El dominio @${domain} no está permitido en esta institución.`,
            );
        }
    }

    private GenerateTempPassword() 
    {
        return crypto.randomBytes(8).toString('hex') + 'Aa1!';
    }

    private async CreateAndSaveAdmin(input: CreateAdminInput, hash: string) 
    {
        const newUser = this.userRepository.create({
            email: input.email,
            fullName: input.fullName,
            password: hash,
            role: UserRole.ADMIN_HORARIOS,
            isTempPassword: true,
            isActive: true,
        });

        return await this.userRepository.save(newUser);
    }

    private SendWelcomeEmail(email: string, pass: string) 
    {
        console.log('\n===================[SIMULACIÓN]===================');
        console.log(' CORREO ENVIADO A: ' + email);
        console.log(' Asunto: Bienvenido a EduSync!');
        console.log(` Contraseña Temporal: ${pass}`);
        console.log(' Nota: tendrá que cambiar su contraseña');
        console.log('       después del primer inicio de sesión.');
        console.log('==================================================\n');
    }
}
