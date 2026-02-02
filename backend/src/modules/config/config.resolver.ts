import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AllowedDomain } from './entities/allowed-domain.entity';
import { ConfigService } from './config.service';

@Resolver(() => AllowedDomain)
export class ConfigResolver 
{
    constructor(private readonly configService: ConfigService) 
    {}

    @Query(() => [AllowedDomain], { name: 'GetAllowedDomains' })
    async GetAllowedDomains(): Promise<AllowedDomain[]> 
    {
        return await this.configService.getAllowedDomains();
    }

    @Mutation(() => AllowedDomain)
    async CreateAllowedDomain(@Args('domain') domain: string): Promise<AllowedDomain> 
    {
        return await this.configService.createDomain(domain);
    }

    @Mutation(() => Boolean)
    async RemoveAllowedDomain(@Args('id', { type: () => Int }) id: number): Promise<boolean> 
    {
        return await this.configService.removeDomain(id);
    }
}
