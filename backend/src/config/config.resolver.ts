import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AllowedDomain } from './entities/allowed-domain.entity';
import { ConfigService } from './config.service';

@Resolver(() => AllowedDomain)
// @UseGuards(GqlAuthGuard) // Descomentar cuando tengamos el Guard listo
export class ConfigResolver
{
    constructor(private readonly configService: ConfigService) {}

    @Query(() => [AllowedDomain], { name: 'GetAllowedDomains' })
    async GetAllowedDomains(): Promise<AllowedDomain[]>
    {
        return await this.configService.GetAllowedDomains();
    }

    @Mutation(() => AllowedDomain)
    async CreateAllowedDomain(@Args('domain') domain: string): Promise<AllowedDomain>
    {
        return await this.configService.CreateDomain(domain);
    }

    @Mutation(() => Boolean)
    async RemoveAllowedDomain(@Args('id', { type: () => Int }) id: number): Promise<boolean>
    {
        return await this.configService.RemoveDomain(id);
    }
}
