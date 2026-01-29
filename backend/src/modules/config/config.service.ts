import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedDomain } from './entities/allowed-domain.entity';

@Injectable()
export class ConfigService 
{
    constructor(
        @InjectRepository(AllowedDomain)
        private readonly domainRepository: Repository<AllowedDomain>,
    ) 
    {}

    async createDomain(domain: string): Promise<AllowedDomain> 
    {
        if (!domain.includes('.')) 
        {
            throw new BadRequestException('Domain must contain a dot.');
        }

        const existing = await this.domainRepository.findOneBy({ domain });
        if (existing) 
        {
            throw new ConflictException('Domain already exists');
        }

        const newDomain = this.domainRepository.create({ domain });
        return await this.domainRepository.save(newDomain);
    }

    async getAllowedDomains(): Promise<AllowedDomain[]> 
    {
        return await this.domainRepository.find();
    }

    async removeDomain(id: number): Promise<boolean> 
    {
        // RQNF-WEB-27: Aquí deberíamos validar si hay usuarios usándolo antes de borrar.
        // Por ahora, borrado directo para el MVP.
        const result = await this.domainRepository.delete(id);
        // CORRECCIÓN: Usamos (result.affected ?? 0) para evitar "possibly undefined"
        return (result.affected ?? 0) > 0;
    }
}
