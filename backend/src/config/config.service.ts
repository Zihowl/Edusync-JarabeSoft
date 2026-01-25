import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedDomain } from './entities/allowed-domain.entity';

@Injectable()
export class ConfigService
{
    constructor(
        @InjectRepository(AllowedDomain)
        private readonly domainRepository: Repository<AllowedDomain>,
    ) {}

    async CreateDomain(domain: string): Promise<AllowedDomain>
    {
        // RQNF-WEB-25: Validar estructura @dominio.ext (Simplificado)
        if (!domain.includes('.')) 
        {
            throw new ConflictException('Invalid domain format');
        }

        // RQNF-WEB-26: Validar duplicidad
        const existing = await this.domainRepository.findOneBy({ domain });
        if (existing) 
        {
            throw new ConflictException('Domain already exists');
        }

        const newDomain = this.domainRepository.create({ domain });
        return await this.domainRepository.save(newDomain);
    }

    async GetAllowedDomains(): Promise<AllowedDomain[]>
    {
        return await this.domainRepository.find();
    }

    async RemoveDomain(id: number): Promise<boolean>
    {
        // RQNF-WEB-27: Aquí deberíamos validar si hay usuarios usándolo antes de borrar.
        // Por ahora, borrado directo para el MVP.
        const result = await this.domainRepository.delete(id);
        // CORRECCIÓN: Usamos (result.affected ?? 0) para evitar "possibly undefined"
        return (result.affected ?? 0) > 0;
    }
}
