import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { AuthPayload } from './auth.interface';
import { UserDto } from '../user/user.dto';
import { LoginOutput } from './auth.dto';

@Injectable()
export class AuthService {
  private JWT_ACCESS_TOKEN_EXPIRATION_MS: number;
  private JWT_REFRESH_TOKEN_EXPIRATION_MS: number;
  private JWT_ACCESS_TOKEN_SECRET: string;
  private JWT_REFRESH_TOKEN_SECRET: string;
  private AUTH_UI_REDIRECT_URL: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_EXPIRATION_MS = this.configService.getOrThrow<number>(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    );
    this.JWT_REFRESH_TOKEN_EXPIRATION_MS =
      this.configService.getOrThrow<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS');
    this.JWT_ACCESS_TOKEN_SECRET = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    this.JWT_REFRESH_TOKEN_SECRET = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    this.AUTH_UI_REDIRECT_URL = this.configService.getOrThrow<string>(
      'AUTH_UI_REDIRECT_URL',
    );
  }

  async login({
    user,
    response,
    redirect = false,
  }: {
    user: UserDto;
    response: Response;
    redirect?: boolean;
  }): Promise<LoginOutput> {
    const authPayload: AuthPayload = {
      userId: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } = await this.getTokens(authPayload);

    const userDto = await this.userService.updateUser({
      id: user.id,
      updates: { refreshToken },
    });

    if (!userDto) {
      throw new UnauthorizedException('User not found.');
    }

    if (redirect) {
      response.redirect(this.AUTH_UI_REDIRECT_URL);
    }

    return { user: userDto, accessToken, refreshToken };
  }

  async loginWithPassword({
    email,
    password,
    response,
    redirect = false,
  }: {
    email: string;
    password: string;
    response: Response;
    redirect?: boolean;
  }): Promise<LoginOutput> {
    const user = await this.verifyUser({ email, password });
    const res = await this.login({ user, response, redirect });
    return res;
  }

  async verifyUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserDto> {
    const user = await this.userService.getUser({
      email,
      includeCredentials: true,
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isAuthenticated = await compare(password, user.password);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async verifyUserRefreshToken({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string | undefined;
  }): Promise<UserDto> {
    const user = await this.userService.getUser({
      id: userId,
      includeCredentials: true,
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException('Credentials are missing.');
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Credentials are missing.');
    }

    const isAuthenticated = refreshToken === user.refreshToken;

    if (!isAuthenticated) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    return user;
  }

  async getTokens(
    payload: AuthPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: Math.floor(this.JWT_ACCESS_TOKEN_EXPIRATION_MS / 1000),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: Math.floor(this.JWT_REFRESH_TOKEN_EXPIRATION_MS / 1000),
    });
    return { accessToken, refreshToken };
  }
}
