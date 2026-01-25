import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService
{
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    // Standard: PascalCase method names
    async ValidateUser(email: string, pass: string): Promise<User>
    {
        const user = await this.usersService.FindOneByEmail(email);

        // RQNF-WEB-04: Validate Argon2 hash
        if (user && await argon2.verify(user.password, pass))
        {
            return user;
        }

        // RQF-WEB-02: Error on invalid credentials
        throw new UnauthorizedException('Invalid credentials');
    }

    async Login(user: User)
    {
        const payload = { sub: user.id, email: user.email, role: user.role };
        
        return {
            accessToken: this.jwtService.sign(payload),
            user: user,
        };
    }
}