import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.userRepository.save({
      id: uuidv4(),
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
      username: createUserDto.username,
    });

    return this.generateTokens(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findOne(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid login or password. Please try again');
    }

    const isPasswordsMatch = await argon2.verify(user.password, loginUserDto.password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Invalid login or password. Please try again');
    }

    return this.generateTokens(user);
  }

  async logout(req: any) {
    req.user = null;
    req.refresh_token = null;
    req.access_token = null;

    return { message: 'User successfully logged out', status: 200 };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return 'No user from Google';
    }

    let user = await this.userRepository.findOne({ where: { email: req.user.email } });

    if (!user) {
      user = await this.userRepository.save({
        id: uuidv4(),
        email: req.user.email,
        username: `${req.user.firstName} ${req.user.lastName}`,
        avatar: req.user.picture,
      });
    }

    return this.generateTokens(user);
  }

  async githubLogin(req: any) {
    if (!req.user) {
      return 'No user from GitHub';
    }

    let user = await this.userRepository.findOne({ where: { email: req.user.email } });

    if (!user) {
      user = await this.userRepository.save({
        id: uuidv4(),
        email: req.user.email,
        username: req.user.username,
      });
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '7d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    return {
      user: this.selectFields(user),
      access_token,
      refresh_token,
    };
  }

  private selectFields(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    };
  }
}

















// import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import * as argon2 from 'argon2';
// import { v4 as uuidv4 } from 'uuid';

// import { UserService } from '../user/user.service';
// import { User } from '../user/entities/user.entity';
// import { CreateUserDto } from './dto/create-user.dto';
// import { LoginUserDto } from './dto/login-user.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) { }

//   async register(createUserDto: CreateUserDto) {
//     const existingUser = await this.userRepository.findOne({
//       where: {
//         email: createUserDto.email,
//       },
//     });
//     if (existingUser) {
//       throw new ConflictException('Користувач з цією адресою вже існує');
//     }
//     const user = await this.userRepository.save({
//       id: uuidv4(),
//       email: createUserDto.email,
//       password: await argon2.hash(createUserDto.password),
//       username: createUserDto.username,
//     });

//     const access_token = await this.generateAccessToken(user);
//     const refresh_token = await this.generateRefreshToken(user)

//     return { user: this.selectFields(user), access_token, refresh_token };
//   }

//   async login(loginUserDto: LoginUserDto) {
//     const user = await this.userService.findOne(loginUserDto.email);

//     if (!user) {
//       throw new UnauthorizedException('Невірний логін або пароль. Спробуйте ще');
//     }

//     const isPasswordsMatch = await argon2.verify(user.password, loginUserDto.password);

//     if (!isPasswordsMatch) {
//       throw new UnauthorizedException('Невірний логін або пароль. Спробуйте ще');
//     }

//     const access_token = await this.generateAccessToken({ ...user })
//     const refresh_token = await this.generateRefreshToken({ ...user })

//     return { user: this.selectFields(user), access_token, refresh_token };
//   }

//   async logout(req: any) {
//     req.user = null;
//     req.refresh_token = null;
//     req.access_token = null;

//     return { message: 'user successfully logged out', status: 200 };
//   }

//   async googleLogin(req) {
//     if (!req.user) {
//       return 'No user from google';
//     }

//     let user = await this.userRepository.findOne({ where: { email: req.user.email } });

//     if (!user) {
//       user = await this.userRepository.save({
//         id: uuidv4(),
//         email: req.user.email,
//         username: `${req.user.firstName} ${req.user.lastName}`,
//         avatar: req.user.picture,
//       });
//     }

//     const access_token = await this.generateAccessToken(user);
//     const refresh_token = await this.generateRefreshToken(user);

//     return { user: this.selectFields(user), access_token, refresh_token };
//   }

//   async githubLogin(req) {
//     if (!req.user) {
//       return 'No user from github';
//     }

//     let user = await this.userRepository.findOne({ where: { email: req.user.email } });

//     if (!user) {
//       user = await this.userRepository.save({
//         id: uuidv4(),
//         email: req.user.email,
//         username: req.user.username,
//       });
//     }

//     const access_token = await this.generateAccessToken(user);
//     const refresh_token = await this.generateRefreshToken(user);

//     return { user: this.selectFields(user), access_token, refresh_token };
//   }


//   private selectFields(user: any) {
//     return {
//       id: user.id,
//       email: user.email,
//       username: user.username,
//       avatar: user.avatar,
//     };
//   }

//   private async generateAccessToken(user: any) {
//     return this.jwtService.sign({
//       email: user.email,
//       id: user.id,
//     }, {
//       secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
//       expiresIn: '3d',
//     });
//   }
//   private async generateRefreshToken(user: any) {
//     return this.jwtService.sign({
//       email: user.email,
//       id: user.id,
//     }, {
//       secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
//       expiresIn: '30d',
//     });
//   }
// }
