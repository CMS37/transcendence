import { Module, forwardRef } from '@nestjs/common';
import { AuthService, JwtAccessStrategy } from './auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, JwtAccessStrategy],
  imports: [HttpModule, PrismaModule, JwtModule, forwardRef(()=> UserModule)],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
