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
        private readonly configService: ConfigService, // Inyectado para validar dominios
    ) {}

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
        // 1. Verificar duplicidad
        const existing = await this.userRepository.findOneBy({ email: input.email });
        if (existing)
        {
            throw new ConflictException('El correo ya está registrado.');
        }

        // 2. Validar dominio permitido
        const parts = input.email.split('@');
        if (parts.length !== 2) throw new BadRequestException('Email inválido');
        const domain = parts[1];
        const allowedDomains = await this.configService.GetAllowedDomains();
        const isAllowed = allowedDomains.some(d => d.domain === domain);
        if (!isAllowed)
        {
            throw new BadRequestException(`El dominio @${domain} no está permitido en esta institución.`);
        }

        // 3. Generar contraseña temporal
        const tempPassword = crypto.randomBytes(8).toString('hex') + 'Aa1!';
        const hash = await argon2.hash(tempPassword);

        // 4. Crear usuario
        const newUser = this.userRepository.create({
            email: input.email,
            fullName: input.fullName,
            password: hash,
            role: UserRole.ADMIN_HORARIOS,
            isTempPassword: true,
            isActive: true
        });

        const savedUser = await this.userRepository.save(newUser);

        // 5. Simular envío de correo
        this.SendWelcomeEmail(input.email, tempPassword);

        return savedUser;
    }

    private SendWelcomeEmail(email: string, pass: string)
    {
        console.log('\n==================================================');
        console.log(' 📧 [SIMULACIÓN] CORREO ENVIADO A: ' + email);
        console.log(' Asunto: Bienvenido a EduSync - Credenciales');
        console.log(` Contraseña Temporal: ${pass}`);
        console.log('==================================================\n');
    }
}