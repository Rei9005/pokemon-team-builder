import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async signup(@Body() dto: SignupDto, @Res() res: Response) {
    const result = await this.authService.signup(dto);

    // Set JWT in httpOnly cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(HttpStatus.CREATED).json({
      id: result.user.id,
      email: result.user.email,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto);

    // Set JWT in httpOnly cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(HttpStatus.OK).json({
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    });
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  logout(@Res() res: Response) {
    // Clear JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 0,
    });

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async me(@Req() req: Request, @Res() res: Response) {
    // Extract JWT from cookie
    const token = req.cookies?.['jwt'] as string | undefined;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    try {
      // Verify token and get user
      const user = await this.authService.verifyToken(token);
      return res.status(HttpStatus.OK).json({
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: 'Invalid token',
      });
    }
  }
}
