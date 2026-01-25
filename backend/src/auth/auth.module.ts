import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: 'SUPER_SECRET_KEY_DEV_ONLY', // Move to .env in production
            signOptions: { expiresIn: '12h' },
        }),
    ],
    providers: [AuthService, AuthResolver],
})
export class AuthModule {}